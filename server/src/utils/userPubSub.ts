import { PubSub } from 'graphql-subscriptions';
import type { IUser } from '../models/Users.ts';

type PubSubChannels = {
  USER_STATUS: { userStatusChanged: IUser }
};

// Создаем ОДИН инстанс на всё приложение и экспортируем его
export const pubsub = new PubSub<PubSubChannels>();
export const USER_STATUS = "USER_STATUS";
