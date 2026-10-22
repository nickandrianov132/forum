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

///// Migrations imports & run:
// import { assignAdminRoles } from "./src/scripts/assign-roles-migration.ts";
// import { migrateOldUsers } from "./src/scripts/migrate-users.ts";
// assignAdminRoles();
// migrateOldUsers();

const app = express();
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

const serverCleanup = useServer(
  { 
    schema,
    onConnect: async (ctx) => {
      const connectionParams = ctx.connectionParams as { authorization?: string };
      const authHeader = connectionParams?.authorization;

      // Если клиент ПЫТАЛСЯ авторизоваться (прислал заголовок)
      if (authHeader) {
        const user = getUserFromHeader(authHeader);
        
        // ЕслиuserId нет (токен протух), возвращаем false. 
        // Это закроет соединение со стороны сервера.
        if (!user) {
          // console.log("WS Connection rejected: Token expired");
          return false; 
        }
      }
      return true; // Разрешаем анонимное или успешное подключение
    },
    context: async (ctx) => {
      // let userId: string | null = null;
      const connectionParams = ctx.connectionParams as { authorization?: string };
      const authHeader = connectionParams?.authorization;

      const user = getUserFromHeader(authHeader);


      return { 
        userId: user?.id || null,
        role: user?.role || null, 
        loaders: createLoaders(user?.id || undefined) 
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
    origin: [
      'http://localhost:5173',
      'https://forum-ltbay0o24-void-7215.vercel.app'
    ], // URL фронтенда
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
