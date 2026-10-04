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
import { getUserIdFromHeader, verifyToken } from "./src/utils/auth.ts";
import type { ILoaders } from "./src/loaders/mainLoader.ts";
import { createLoaders } from "./src/loaders/mainLoader.ts";
import { env } from "./src/config.ts";


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
    origin: 'http://localhost:5173', // URL фронтенда
    credentials: true,               // Разрешает куки и заголовки авторизации
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }): Promise<MyContext> => {
        const userId = getUserIdFromHeader(req.headers.authorization);  
    
        return { 
          userId, 
          loaders: createLoaders(userId || undefined) 
      };
    },

  }),
);
const PORT = env.PORT;

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
