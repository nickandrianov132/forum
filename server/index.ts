import { ApolloServer } from "@apollo/server";
import mongoose from "mongoose";
import dns from 'node:dns/promises';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);
import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { WebSocketServer } from 'ws';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express from 'express';
import schema from "./src/schema.ts"
import { useServer } from 'graphql-ws/use/ws';
import { getUserFromHeader } from "./src/utils/auth.ts";
import type { ILoaders } from "./src/loaders/mainLoader.ts";
import { createLoaders } from "./src/loaders/mainLoader.ts";
import { env } from "./src/config.ts";
import { UserModel } from "./src/models/Users.ts";
import { EventEmitter } from "node:events";
import { pubsub } from "./src/utils/userPubSub.ts";
import { redis } from './src/utils/redis.ts';

export const globalEvents = new EventEmitter();
///// Migrations imports & run:
// import { assignAdminRoles } from "./src/scripts/assign-roles-migration.ts";
// import { migrateOldUsers } from "./src/scripts/migrate-users.ts";
// assignAdminRoles();
// migrateOldUsers();


async function checkAndCleanOfflineUsers() {
  try {
    // 1. Быстро выгребаем из оперативной памяти Redis ВСЕ ключи онлайн-пользователей
    const keys = await redis.keys('user:*:status');
    
    // Находим в MongoDB всех пользователей, которые сейчас числятся в сети
    const onlineInDb = await UserModel.find({ isOnline: true }, '_id login role avatar');

    for (const dbUser of onlineInDb) {
      const userId = String(dbUser._id);
      const expectedRedisKey = `user:${userId}:status`;

      // 2. ГЛАВНАЯ ПРОВЕРКА: Если пользователь в MongoDB числится ОНЛАЙН, 
      // но его ключа в Redis УЖЕ НЕТ (время жизни 45 секунд вышло)
      if (!keys.includes(expectedRedisKey)) {
        console.log(`[Background Cleaner] -> Пользователь ${dbUser.login} пропал из Redis (телефон выключен/вкладка закрыта). Гасим статус...`);

        // Переводим в оффлайн в MongoDB
        dbUser.isOnline = false;
        await dbUser.save();

        // Мгновенно рассылаем всем сокетам статус оффлайна
        pubsub.publish('USER_STATUS', {
          userStatusChanged: {
            id: userId,
            isOnline: false,
            login: dbUser.login,
            role: dbUser.role,
            avatar: (dbUser as any).avatar || ""
          } as any
        });
      }
    }
  } catch (err) {
    console.error("Ошибка фоновой очистки статусов:", err);
  }
}

setInterval(checkAndCleanOfflineUsers, 30000);


const app = express();
app.use(cors({
  origin: [
    'https://mu-void.com',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const httpServer = createServer(app);
export interface MyContext {
  userId?: string | null;
  role: string | null;
  loaders: ILoaders; // теперь TS знает про userLoader, likeLoader и т.д.
}

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  // This is the `httpServer` we created in a previous step.
  server: httpServer,
  // Pass a different path here if app.use
  // serves expressMiddleware at a different path
  path: '/graphql',
});


interface ISessionData {
  userId: string;
  login: string;
}
const socketSessionMap = new WeakMap<object, ISessionData>();


const serverCleanup = useServer(
  {
    schema,
    onConnect: async (ctx) => {
      const connectionParams = ctx.connectionParams as { authorization?: string };
      const authHeader = connectionParams?.authorization;
      
      if (authHeader) {
        const tokenUser = getUserFromHeader(authHeader) as any;
        if (!tokenUser || !tokenUser.id) {
          console.log("[WS System] -> Токен протух или невалиден при коннекте. Пускаем сессию как гостя, ждем HTTP-рефреша токенов...");
          return true; 
        }
        
        const userId = String(tokenUser.id);
        const dbUser = await UserModel.findById(userId);
        
        if (dbUser) {
          // Сохраняем сессию сокета, чтобы знать, кто отключился в onDisconnect
          socketSessionMap.set(ctx, {
            userId: userId,
            login: dbUser.login || "Пользователь"
          });

          const redisKey = `user:${userId}:status`;

          // 1. Ставим флаг онлайна в Redis на 45 секунд
          await redis.set(redisKey, 'ONLINE', 'EX', 45);

          // 2. Если в MongoDB пользователь числился оффлайн — включаем его
          if (!dbUser.isOnline) {
            dbUser.isOnline = true;
            await dbUser.save();
            
            const userPayload = {
              id: String(dbUser._id),
              login: dbUser.login,
              isOnline: true,
              role: dbUser.role,
              avatar: (dbUser as any).avatar || "",
              __typename: "User"
            };
            // Оповещаем другие клиенты о входе в сеть
            pubsub.publish("USER_STATUS", { userStatusChanged: userPayload as any });
            console.log(`[WS System] -> Пользователь ${dbUser.login} подключился.`);
          }
        }
      }
      return true;
    },
    context: async (ctx) => {
      const connectionParams = ctx.connectionParams as { authorization?: string };
      const authHeader = connectionParams?.authorization;
      const user = authHeader ? getUserFromHeader(authHeader) : null;
      return {
        userId: user?.id || null,
        role: user?.role || null,
        loaders: createLoaders(user?.id || undefined)
      };
    },
    onDisconnect: async (ctx) => { // Снова делаем функцию async для работы с Redis
      const session = socketSessionMap.get(ctx);
      
    if (session) {
        const userId = session.userId;
        const userLogin = session.login;

        const dbUser = await UserModel.findById(userId);
        socketSessionMap.delete(ctx);
        
        console.log(`[WS System] -> Вкладка закрыта для ${userLogin}. Принудительно тушим статус...`);
        try {
          const redisKey = `user:${userId}:status`;
          // 1. Стираем ключ в Redis, чтобы очистить оперативную память
          await redis.del(redisKey); 
          // 2. НАПРЯМУЮ шлем пакет оффлайна в GraphQL сокеты ВСЕМ остальным пользователям!
          // Теперь нам не нужно ждать, пока сработает фоновый триггер в redis.ts
          pubsub.publish('USER_STATUS', {
            userStatusChanged: {
              id: userId,
              isOnline: false,
              role: dbUser?.role,
              login: userLogin,
              avatar: (dbUser as any).avatar || "",
              __typename: "User"
            } as any
          });

          // 3. Фиксируем оффлайн в MongoDB
          await UserModel.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
          
          console.log(`[WS System] -> Статус оффлайн для ${userLogin} успешно разослан всем клиентам.`);

        } catch (err) {
          console.error(`[WS Disconnect Error] Ошибка при закрытии сокета для ${userLogin}:`, err);
        }
      }
    }
  },
  wsServer,
);

const server = new ApolloServer({
  schema,
    // Перехватчик ошибок для Apollo Server
  formatError: (formattedError, error: any) => {
    const originalError = error?.originalError;

    // Проверка ошибки дублирования MongoDB (E11000)
    if (originalError && originalError.code === 11000) {
      const keyValue = originalError.keyValue || {};
      const field = Object.keys(keyValue)[0] || "field";

      // Возвращаем строго отформатированный объект GraphQLFormattedError
      return {
        ...formattedError, // сохраняем базовые свойства (path, locations), если они есть
        message: `This ${field} already exist!`,
        extensions: {
          ...formattedError.extensions,
          code: 'BAD_USER_INPUT',
          argumentName: field,
        }
      };
    }

    // Во всех остальных случаях возвращаем стандартную ошибку без изменений
    return formattedError;
  },
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();

          },
        };
      },
    },
  ],

});


await server.start();
app.use(
  '/graphql',
  cors<cors.CorsRequest>({
    origin: true,
    // origin: [
    //   'http://localhost:5173',
    //   'https://forum-ltbay0o24-void-7215.vercel.app'
    // ], // URL фронтенда
    credentials: true,               // Разрешает куки и заголовки авторизации
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }): Promise<MyContext> => {
        const user = getUserFromHeader(req.headers.authorization);  
    
        return { 
          userId: user?.id || null,
          role: user?.role || null, 
          loaders: createLoaders(user?.id || undefined) 
      };
    },

  }),
);
const PORT = env.PORT || 7001;
// const uri = "mongodb+srv://nick132:1322009Nick$@cluster0.dq4k6vy.mongodb.net/?appName=Cluster0"
// const uri = 'mongodb://127.0.0.1:27017'

// await mongoose.connect(uri, {dbName: "forum"}).
// then(res => console.log("Connected to MongoDB_forum")).
// catch(error => console.log(error))
// const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}/graphql`);
});



async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI, { dbName: "forum" });
    console.log("Connected to MongoDB_forum");
  } catch (error) {
    console.error("Connection error:", error);
  }
}

connectDB();




