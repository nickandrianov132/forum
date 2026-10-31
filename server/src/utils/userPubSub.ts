import { PubSub } from 'graphql-subscriptions';
import type { IUser } from '../models/Users.ts';

type PubSubChannels = {
  USER_STATUS: { userStatusChanged: IUser }
};
// type PubSubChannels = {
//   USER_STATUS: { userStatusChanged: Pick<IUser, "id"| "isOnline" | "login" | "avatar"> & Partial<Pick<IUser, "role">> }
// };


// Создаем ОДИН инстанс на всё приложение и экспортируем его
export const pubsub = new PubSub<PubSubChannels>();
export const USER_STATUS = "USER_STATUS";
