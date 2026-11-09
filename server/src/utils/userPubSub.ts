import { PubSub } from 'graphql-subscriptions';
import type { IUser } from '../models/Users.ts';

type PubSubChannels = {
  USER_STATUS: { userStatusChanged: IUser }
};


export const pubsub = new PubSub<PubSubChannels>();
export const USER_STATUS = "USER_STATUS";
