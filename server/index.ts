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
import { getUserIdFromHeader, verifyToken } from "./src/utils/auth.ts";
import type { ILoaders } from "./src/loaders/mainLoader.ts";
import { createLoaders } from "./src/loaders/mainLoader.ts";

const app = express();
const httpServer = createServer(app);
export interface MyContext {
  userId?: string | null;
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

const serverCleanup = useServer(
  { 
    schema,
    onConnect: async (ctx) => {
      const connectionParams = ctx.connectionParams as { authorization?: string };
      const authHeader = connectionParams?.authorization;

      // Если клиент ПЫТАЛСЯ авторизоваться (прислал заголовок)
      if (authHeader) {
        const userId = getUserIdFromHeader(authHeader);
        
        // ЕслиuserId нет (токен протух), возвращаем false. 
        // Это закроет соединение со стороны сервера.
        if (!userId) {
          console.log("WS Connection rejected: Token expired");
          return false; 
        }
      }
      return true; // Разрешаем анонимное или успешное подключение
    },
    context: async (ctx) => {
      // let userId: string | null = null;
      const connectionParams = ctx.connectionParams as { authorization?: string };
      const authHeader = connectionParams?.authorization;

      const userId = getUserIdFromHeader(authHeader);


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
  cors<cors.CorsRequest>({
    origin: 'http://localhost:5173', // URL твоего фронтенда
    credentials: true,               // Разрешает куки и заголовки авторизации
  }),
  express.json(),
  expressMiddleware(server, {
  context: async ({ req }): Promise<MyContext> => {
  const userId = getUserIdFromHeader(req.headers.authorization);
  // let userId: string | null = null; // 1. Объявляем переменную заранее
  // const authHeader = req.headers.authorization || '';
  // if (authHeader.startsWith('Bearer ')) {
  //   const token = authHeader.split(' ')[1];
  //   try {
  //     if (token) {
  //       const decoded = verifyToken(token);
  //       if (decoded) {
  //         // ВАЖНО: берем decoded.id (как в логе), а не ищем в базе
  //         userId = decoded.id; 
  //       }

  //     }
  //   } catch (err) {
  //     console.error("JWT verification failed", err);
  //   }
  // }
  // 3. Теперь userId доступен здесь для лоадеров
  return { 
    userId, 
    loaders: createLoaders(userId || undefined) 
  };
},

  }),
);
const PORT = 7000;

// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}/graphql`);
});


// const uri = "mongodb+srv://nick132:1322009Nick$@cluster0.dq4k6vy.mongodb.net/?appName=Cluster0"
// const uri = 'mongodb://127.0.0.1:27017'

// await mongoose.connect(uri, {dbName: "forum"}).
// then(res => console.log("Connected to MongoDB_forum")).
// catch(error => console.log(error))
const uri = 'mongodb://127.0.0.1:27017';

async function connectDB() {
  try {
    await mongoose.connect(uri, { dbName: "forum" });
    console.log("Connected to MongoDB_forum");
  } catch (error) {
    console.error("Connection error:", error);
  }
}

connectDB();
