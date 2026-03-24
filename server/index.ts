import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
// import { typeDefs } from "./schema.ts";
// import { resolvers } from "./resolvers.ts";
import mongoose from "mongoose";
import dns from 'node:dns/promises';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

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
import { UserModel } from "./src/models/Users.ts";
import { verifyToken } from "./src/utils/auth.ts";
import type { ILoaders } from "./src/loaders/mainLoader.ts";
import { createLoaders } from "./src/loaders/mainLoader.ts";

const app = express();
const httpServer = createServer(app);
// const schema = makeExecutableSchema({ typeDefs, resolvers });
export interface MyContext {
  userId?: string | null;
  loaders: ILoaders; // теперь TS знает про userLoader, likeLoader и т.д.
}

// const server = new ApolloServer({
//   schema,
// });

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  // This is the `httpServer` we created in a previous step.
  server: httpServer,
  // Pass a different path here if app.use
  // serves expressMiddleware at a different path
  path: '/graphql',
});
// Hand in the schema we just created and have the
// WebSocketServer start listening.
// const serverCleanup = useServer(
//   { schema,
//     context: async (ctx) => {
//       // 1. Приводим типы: говорим TS, что в параметрах может быть строка authorization
//       const connectionParams = ctx.connectionParams as { authorization?: string };
//       const authHeader = connectionParams?.authorization;

//       if (authHeader && authHeader.startsWith('Bearer ')) {
//         const token = authHeader.split(' ')[1]; // Теперь .split() доступен
        
//         if (token) {
//           const decoded = verifyToken(token);
//           if (decoded) {
//             const user = await UserModel.findOne({ 
//               login: decoded.login, 
//               password: decoded.password 
//             });
//             return { userId: user ? user.id : null };
//           }
//         }
//       }
//       return { userId: null };
//     },
//   },
//    wsServer
// );
const serverCleanup = useServer(
  { 
    schema,
//     context: async ({ req }): Promise<MyContext> => {
//   const authHeader = req.headers.authorization || '';
//   let userId: string | null = null;

//   console.log('--- Context Step 1: Auth Header ---', authHeader);

//   if (authHeader.startsWith('Bearer ')) {
//     const token = authHeader.split(' ')[1];
//     const decoded = verifyToken(token);
    
//     if (decoded && decoded.id) {
//       userId = decoded.id; // Берем ID напрямую из токена
//       console.log('--- Context Step 2: User Identified ---', userId);
//     } else {
//       console.log('--- Context Step 2: Token Invalid or No ID ---', decoded);
//     }
//   }

//   return { 
//     userId, 
//     loaders: createLoaders(userId || undefined) 
//   };
// },
    context: async (ctx) => {
      let userId: string | null = null;
      const connectionParams = ctx.connectionParams as { authorization?: string };
      const authHeader = connectionParams?.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token) {
        const decoded = verifyToken(token);
          if (decoded && decoded.id) {
            userId = decoded.id; // Берем ID напрямую из токена
            // const user = await UserModel.findOne({ login: decoded.login, password: decoded.password });
            // userId = user ? user.id : null;
          }
        }
      }

      return { 
        userId, 
        loaders: createLoaders(userId || undefined) 
      };
    },
  },
  wsServer
);

const server = new ApolloServer({
  schema,
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
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }): Promise<MyContext> => {
  let userId: string | null = null; // 1. Объявляем переменную заранее
  const authHeader = req.headers.authorization || '';

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      if (token) {
        const decoded = verifyToken(token);
        // console.log('DECODED TOKEN:', decoded); // Посмотрите, что здесь
        if (decoded) {
          // ВАЖНО: берем decoded.id (как в логе), а не ищем в базе
          userId = decoded.id; 
          // console.log('FINAL CONTEXT USERID:', userId); 
        }
        // if (decoded) {
        //   // Ищем пользователя
        //   const user = await UserModel.findOne({ 
        //     login: decoded.login, 
        //     password: decoded.password
        //   });
        //   userId = user ? user._id.toString() : null; // 2. Присваиваем значение
        // }
      }
    } catch (err) {
      console.error("JWT verification failed", err);
    }
  }
  // 3. Теперь userId доступен здесь для лоадеров
  return { 
    userId, 
    loaders: createLoaders(userId || undefined) 
  };
},
 // Эта функция создает контекст для каждого запроса
    // context: async ({ req }) => {
    //   const authHeader = req.headers.authorization || '';
      
    //   if (authHeader.startsWith('Bearer ')) {
    //     const token = authHeader.split(' ')[1] || "";
    //     try {
    //       // Проверяем токен (замените 'YOUR_SECRET_KEY' на переменную окружения)
    //       // const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'SECRET')as unknown as MyJwtPayload;
    //       if (token) {
    //         const decoded = verifyToken(token);
    //         if (decoded) {
    //           const user = await UserModel.findOne({ login: decoded.login, password: decoded.password })
    //           return {userId: user ? user.id : null};
    //         }
    //       }
    //     } catch (err) {
    //       // Если токен невалиден, можно либо кинуть ошибку, либо просто вернуть пустой контекст
    //       console.error("JWT verification failed");
    //     }
    //   }

    //   return { 
    //     userId: null,
    //     loaders: createLoaders(userId || undefined) 
    //    };
    // },
  }),
);
const PORT = 7000;

// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}/graphql`);
});
///

const uri = "mongodb+srv://nick132:1322009Nick$@cluster0.dq4k6vy.mongodb.net/?appName=Cluster0"

await mongoose.connect(uri, {dbName: "forum"}).
then(res => console.log("Connected to MongoDB_forum")).
catch(error => console.log(error))
