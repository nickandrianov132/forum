// server/src/utils/redis.ts
import {Redis} from 'ioredis';
import { pubsub } from './userPubSub.ts';
import mongoose from 'mongoose';
import { env } from '../config.ts';

// Берем URL из файла .env, если его нет — подставляем локальный дефолт
const redisUrl = env.REDIS_URL;

// Создаем подключения по URL
export const redis = new Redis(redisUrl);
// const redisSubscriber = new Redis(redisUrl);

// // Настройка генерации событий "expired" прямо из кода Node.js при старте.
// // Это подстраховка на случай, если на Render нельзя настроить флаг запуска контейнера вручную!
// redis.config('SET', 'notify-keyspace-events', 'Ex').catch(err => {
//   console.log('[Redis Config] Предупреждение: Не удалось установить флаг Ex через команду CONFIG (возможно, на Render это запрещено политикой безопасности, это нормально):', err.message);
// });

// redisSubscriber.subscribe('__keyevent@0__:expired');
// // redisSubscriber.subscribe('__keyevent@0__:del');

// redisSubscriber.on('message', async (channel, key) => {
//   if (key.startsWith('user:') && key.endsWith(':status')) {
//     const userId = key.split(':')[1]; // Корректно забираем ID из строки "user:ID:status"

//     console.log(`[Redis System] -> Сработал таймаут. Пользователь ${userId} переведен в ОФФЛАЙН.`);

//     // Публикация оффлайна в GraphQL Subscriptions
//     pubsub.publish('USER_STATUS', {
//       userStatusChanged: {
//         id: userId,
//         isOnline: false,
//         login: "Пользователь ушел", 
//         role: "User",
//         avatar: null,
//         __typename: "User"
//       } as any
//     });

//     // Ленивое обновление статуса в MongoDB
//     try {

//       if (mongoose.models.User) {
//         await mongoose.models.User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
//       }
//     } catch (err) {
//       console.error(`Ошибка фиксации оффлайна в MongoDB для ${userId}:`, err);
//     }
//   }
// });
