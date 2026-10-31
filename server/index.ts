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
import { pubsub } from "./src/utils/userPubSub.ts";
import { redis } from './src/utils/redis.ts';

export const globalEvents = new EventEmitter();
///// Migrations imports & run:
// import { assignAdminRoles } from "./src/scripts/assign-roles-migration.ts";
// import { migrateOldUsers } from "./src/scripts/migrate-users.ts";
// assignAdminRoles();
// migrateOldUsers();

// ГЛОБАЛЬНЫЙ МОСТ: Каждый раз, когда в эмиттер летит событие,
// мы пересылаем его в pubsub из стабильного глобального контекста сервера
// globalEvents.on("STATUS_CHANGED", (payload) => {
//   pubsub.publish("USER_STATUS", payload);
// });

// export async function setGlobalUserOffline(userId: string, userLogin: string) {
//   try {
//     const dbUser = await UserModel.findById(userId);
//     if (dbUser && dbUser.isOnline) {
//       dbUser.isOnline = false;
//       await dbUser.save();

//       const userPayload = {
//         id: String(dbUser._id),
//         login: dbUser.login,
//         isOnline: false,
//         role: dbUser.role,
//         avatar: (dbUser as any).avatar || "",
//         __typename: "User"
//       };
//       // Шлем событие через единый PubSub — теперь его услышат ВСЕ клиенты
//       pubsub.publish("USER_STATUS", { userStatusChanged: userPayload as any});
//       console.log(`[Status System] -> Пользователь ${userLogin} успешно переведен в ОФФЛАЙН.`);
//     }
//   } catch (err) {
//     console.error(`[Status System] Ошибка перевода в оффлайн для ${userLogin}:`, err);
//   }
// }
// setInterval(async () => {
//   // Страховочный таймаут: 3 минуты бездействия
//   const offlineThreshold = new Date(Date.now() - 3 * 60 * 1000); 
//   try {
//     const expiredUsers = await UserModel.find({
//       isOnline: true,
//       lastSeen: { $lt: offlineThreshold }
//     });

//     for (const user of expiredUsers) {
//       // Очищаем счетчики сокетов для этого пользователя на всякий случай
//       userSocketCounts.delete(String(user._id));
//       // Переводим в оффлайн через общую функцию
//       await setGlobalUserOffline(String(user._id), user.login || "Пользователь");
//       console.log(`[Страховка] Мобилка ${user.login} уснула. Погасили статус по таймауту.`);
//     }
//   } catch (err) {
//     console.error("[Страховка Error] Ошибка проверки:", err);
//   }
// }, 120000); // Проверка запускается раз в 2 минуты



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


// const serverCleanup = useServer(
//   {
//     schema,
//     onConnect: async (ctx) => {
//       const connectionParams = ctx.connectionParams as { authorization?: string };
//       const authHeader = connectionParams?.authorization;
      
//       if (authHeader) {
//         const tokenUser = getUserFromHeader(authHeader) as any;
//         if (!tokenUser || !tokenUser.id) return false;
        
//         const userId = String(tokenUser.id);
//         const dbUser = await UserModel.findById(userId);
        
//         if (dbUser) {
//           socketSessionMap.set(ctx, {
//             userId: userId,
//             login: dbUser.login || "Пользователь"
//           });

//           // Отменяем таймер оффлайна, если пользователь вернулся (F5)
//           if (userOfflineTimers.has(userId)) {
//             clearTimeout(userOfflineTimers.get(userId)!);
//             userOfflineTimers.delete(userId);
//             console.log(`[WS] Пользователь ${dbUser.login} успел переподключиться. Таймер оффлайна отменен.`);
//           }

//           const currentCount = userSocketCounts.get(userId) || 0;
//           userSocketCounts.set(userId, currentCount + 1);

//           if (currentCount === 0 || !dbUser.isOnline) {
//             dbUser.isOnline = true;
//             await dbUser.save();
            
//             const userPayload = {
//               id: String(dbUser._id),
//               login: dbUser.login,
//               isOnline: true,
//               role: dbUser.role,
//               avatar: (dbUser as any).avatar || "",
//               __typename: "User"
//             };
//             pubsub.publish("USER_STATUS", { userStatusChanged: userPayload as any });
//           }
//         }
//       }
//       return true;
//     },
//     context: async (ctx) => {
//       const connectionParams = ctx.connectionParams as { authorization?: string };
//       const authHeader = connectionParams?.authorization;
//       const user = authHeader ? getUserFromHeader(authHeader) : null;
//       return {
//         userId: user?.id || null,
//         role: user?.role || null,
//         loaders: createLoaders(user?.id || undefined)
//       };
//     },
//     onDisconnect: (ctx) => { // Обратите внимание: убрали async с самого хука
//       const session = socketSessionMap.get(ctx);
      
//       if (session) {
//         const userId = session.userId;
//         const userLogin = session.login;
        
//         socketSessionMap.delete(ctx);

//         const currentCount = userSocketCounts.get(userId) || 0;
//         const newCount = currentCount - 1;

//         if (newCount <= 0) {
//           userSocketCounts.delete(userId);
          
//           if (!userOfflineTimers.has(userId)) {
//             console.log(`[WS] Последняя вкладка ${userLogin} закрыта. Запуск быстрого таймера...`);
            
//             const timer = setTimeout(() => {
//               userOfflineTimers.delete(userId);

//               if (!userSocketCounts.has(userId)) {
//                 // Запускаем асинхронную функцию изолированно, не блокируя сокет-сервер
//                 setGlobalUserOffline(userId, userLogin).catch(err => console.error(err));
//               }
//             }, 1500); // 1.5 секунды задержки для F5 / переключения вкладок

//             userOfflineTimers.set(userId, timer);
//           }
//         } else {
//           userSocketCounts.set(userId, newCount);
//         }
//       }
//     }
//   },
//   wsServer,
// );


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
      // if (session) {
      //   const userId = session.userId;
      //   const userLogin = session.login;
        
      //   socketSessionMap.delete(ctx);
      //   console.log(`[WS System] -> Вкладка закрыта для ${userLogin}. Принудительно удаляем сессию из Redis...`);

      //   try {
      //     const redisKey = `user:${userId}:status`;
          
      //     // Вместо того чтобы ждать 45 секунд, мы просто удаляем ключ из Redis прямо сейчас!
      //     // Это мгновенно вызовет событие "expired" внутри нашего файла redis.ts,
      //     // и все остальные пользователи сразу увидят статус ОФФЛАЙН, а MongoDB обновится.
      //     await redis.del(redisKey); 
      //     console.log(`[WS System] -> удалось удалить ключ в Redis для ${userLogin}.`);
      //   } catch (err) {
      //     console.error(`[WS Disconnect Error] Не удалось удалить ключ в Redis для ${userLogin}:`, err);
      //   }
      // }

      // if (session) {
      //   const userId = session.userId;
      //   const userLogin = session.login;
        
      //   socketSessionMap.delete(ctx);
      //   console.log(`[WS System] -> Соединение закрыто для ${userLogin}. Проверяем состояние...`);

      //   // Вместо кастомных счетчиков вкладок, мы даем пользователю 5 секунд на перезагрузку страницы (F5).
      //   // Мы просто уменьшаем TTL ключа в Redis до 5 секунд.
      //   // Если за 5 секунд он не откроет новую вкладку/не обновит страницу — Redis сам его удалит и погасит статус!
      //   try {
      //     const redisKey = `user:${userId}:status`;
      //     const exists = await redis.exists(redisKey);
          
      //     if (exists) {
      //       // Даем 5 секунд «форы» на случай перезагрузки страницы (F5)
      //       await redis.expire(redisKey, 5); 
      //     }
      //   } catch (err) {
      //     console.error(`[WS Disconnect Error] Не удалось обновить TTL в Redis для ${userLogin}:`, err);
      //   }
      // }
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
const PORT = env.PORT || 7000;
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




