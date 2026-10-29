import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import mongoose from "mongoose";
import dns from 'node:dns/promises';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);
import { GraphQLError } from "graphql";
/// for Subscriptions Http and WebSockets:
import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express from 'express';
import schema from "./src/schema.ts"
import { useServer } from 'graphql-ws/use/ws';
import { getUserFromHeader, verifyToken } from "./src/utils/auth.ts";
import type { ILoaders } from "./src/loaders/mainLoader.ts";
import { createLoaders } from "./src/loaders/mainLoader.ts";
import { env } from "./src/config.ts";
import { UserModel, type IUser } from "./src/models/Users.ts";
import { PubSub } from "graphql-subscriptions";
import { EventEmitter } from "node:events";
export const globalEvents = new EventEmitter();

// ГЛОБАЛЬНЫЙ МОСТ: Каждый раз, когда в эмиттер летит событие,
// мы пересылаем его в pubsub из стабильного глобального контекста сервера
globalEvents.on("STATUS_CHANGED", (payload) => {
  pubsub.publish("USER_STATUS", payload);
});

///// Migrations imports & run:
// import { assignAdminRoles } from "./src/scripts/assign-roles-migration.ts";
// import { migrateOldUsers } from "./src/scripts/migrate-users.ts";
// assignAdminRoles();
// migrateOldUsers();

type PubSubChannels = {
  USER_STATUS: { userStatusChanged: IUser }
};
const pubsub = new PubSub<PubSubChannels>();




const app = express();
app.use(cors({
  origin: true, // Временно разрешаем абсолютно любой домен для стопроцентного теста
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


// Карта для подсчета вкладок: userId -> количество открытых сокетов
const userSocketCounts = new Map<string, number>();

// Хранилище активных таймеров оффлайна: userId -> NodeJS.Timeout
const userOfflineTimers = new Map<string, NodeJS.Timeout>();

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
        if (!tokenUser || !tokenUser.id) return false;
        
        const userId = String(tokenUser.id);
        const dbUser = await UserModel.findById(userId);
        
        if (dbUser) {
          socketSessionMap.set(ctx, {
            userId: userId,
            login: dbUser.login || "Пользователь"
          });

          // Отменяем таймер оффлайна, если пользователь вернулся (F5)
          if (userOfflineTimers.has(userId)) {
            clearTimeout(userOfflineTimers.get(userId)!);
            userOfflineTimers.delete(userId);
            console.log(`[WS] Пользователь ${dbUser.login} успел переподключиться. Таймер оффлайна отменен.`);
          }

          const currentCount = userSocketCounts.get(userId) || 0;
          userSocketCounts.set(userId, currentCount + 1);

          if (currentCount === 0 || !dbUser.isOnline) {
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
            pubsub.publish("USER_STATUS", { userStatusChanged: userPayload as any });
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
    onDisconnect: async (ctx) => {
      const session = socketSessionMap.get(ctx);
      
      if (session) {
        const userId = session.userId;
        const userLogin = session.login;
        
        socketSessionMap.delete(ctx);

        const currentCount = userSocketCounts.get(userId) || 0;
        const newCount = currentCount - 1;

        if (newCount <= 0) {
          userSocketCounts.delete(userId);
          
          if (!userOfflineTimers.has(userId)) {
            // console.log(`[WS] Соединение ${userLogin} закрыто. Запуск таймаута на оффлайн...`);
            
            const timer = setTimeout(async () => {
              userOfflineTimers.delete(userId);

              if (!userSocketCounts.has(userId)) {
                try {
                  const serverPort = env.PORT || 10000; 
                  const baseUrl = process.env.RENDER_EXTERNAL_URL || env.RENDER_EXTERNAL_URL || `http://localhost:${serverPort}`;
                  
                  // Убираем возможный слеш на конце и добавляем эндпоинт graphql
                  const graphqlUrl = `${baseUrl.replace(/\/$/, "")}/graphql`;

                  const mutationQuery = {
                    query: `
                      mutation InternalLogOut($id: String) {
                        logOut(id: $id)
                      }
                    `,
                    variables: {
                      id: userId // Передаем ID пользователя, закрывшего вкладку
                    }
                  };

                  await fetch(graphqlUrl, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify(mutationQuery)
                  });

                  // console.log(`[WS] -> Системный вызов мутации logOut для ${userLogin} успешно выполнен.`);
                } catch (err) {
                  // console.error("[WS] Ошибка при автоматическом вызове мутации logOut:", err);
                }
              }
            }, 1200);

            userOfflineTimers.set(userId, timer);
          }
        } else {
          userSocketCounts.set(userId, newCount);
          // console.log(`[WS] У пользователя ${userLogin} осталось открытых соединений: ${newCount}`);
        }
      }
    }
  },
  wsServer
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
const PORT = env.PORT || 7000;

// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}/graphql`);
});


// const uri = "mongodb+srv://nick132:1322009Nick$@cluster0.dq4k6vy.mongodb.net/?appName=Cluster0"
// const uri = 'mongodb://127.0.0.1:27017'

// await mongoose.connect(uri, {dbName: "forum"}).
// then(res => console.log("Connected to MongoDB_forum")).
// catch(error => console.log(error))
// const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';

async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI, { dbName: "forum" });
    console.log("Connected to MongoDB_forum");
  } catch (error) {
    console.error("Connection error:", error);
  }
}

connectDB();
