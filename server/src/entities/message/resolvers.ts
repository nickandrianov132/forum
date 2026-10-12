import { GraphQLError } from "graphql";
import { PubSub } from "graphql-subscriptions";
import type { Resolvers } from "../../types/resolvers-types.ts";
import type { MyContext } from "../../../index.ts";
import { MessageModel, type IMessage } from "../../models/Messages.ts";
import { UserModel } from "../../models/Users.ts";

const MESSAGE_ADDED = "MESSAGE_ADDED";
type PubSubChannels = {
  MESSAGE_ADDED: { messageAdded: IMessage };
};

const pubsub = new PubSub<PubSubChannels>();

const resolvers: Resolvers<MyContext> = {
  Query: {
    messages: async () => {
      // Возвращаем историю чата (например, последние 100 сообщений)
      return await MessageModel.find().sort({ createdAt: 1 }).limit(100);
    }
  },

  Mutation: {
    sendMessage: async (_, { text, userId }) => {
      // 1. Создаем и сохраняем сообщение в MongoDB
      const newMessage = await MessageModel.create({ text, userId });

      // 2. Публикуем событие в WebSocket-канал для подписчиков
      pubsub.publish(MESSAGE_ADDED, { messageAdded: newMessage });

      return newMessage;
    }
  },

  Subscription: {
    messageAdded: {
      // Асинхронный итератор слушает триггер и пушит данные на фронтенд
      subscribe: () => pubsub.asyncIterableIterator([MESSAGE_ADDED])
    }
  },

  // Вложенный резолвер для Message (разрешает поля id и user)
  Message: {
    id: (parent) => parent._id.toString(),
    userId: (parent) => parent.userId.toString(),
    
    user: async (parent) => {
      // parent — это IMessage. Достаем его userId и ищем юзера в базе
      const user = await UserModel.findById(parent.userId);
      if (!user) {
        throw new GraphQLError("Автор сообщения не найден в базе данных");
      }
      return user;
    }
  }
};

export default resolvers;
