import DataLoader from 'dataloader';
import { UserModel } from '../models/Users.ts';
import { LikeModel } from '../models/Likes.ts';
import { DislikeModel } from '../models/Dislikes.ts';
import mongoose from 'mongoose';

export type ILoaders = ReturnType<typeof createLoaders>;

export const createLoaders = (currentUserId?: string) => ({
  // Группирует запросы авторов: вместо 20 запросов по одному ID -> 1 запрос с $in: [ids]
  userLoader: new DataLoader(async (ids: readonly string[]) => {
    const users = await UserModel.find({ _id: { $in: ids } });
    const userMap = new Map(users.map(u => [u.id.toString(), u]));
    return ids.map(id => userMap.get(id.toString()) || null);
  }),

  // Проверка лайков: сразу для всех постов в запросе
  likeLoader: new DataLoader(async (postIds: readonly string[]) => {
    if (!currentUserId) return postIds.map(() => false);
    const likes = await LikeModel.find({ 
      postId: { $in: postIds as string[] }, // Явно указываем массив строк
      userId: currentUserId 
    });
    const likedPostIds = new Set(
        likes.map(l => l.postId?.toString()).filter(Boolean)
    );
    return postIds.map(id => likedPostIds.has(id.toString()));
  }),
    dislikeLoader: new DataLoader(async (postIds: readonly string[]) => {
    if (!currentUserId) return postIds.map(() => false);

    const dislikes = await DislikeModel.find({ 
        postId: { $in: postIds as string[] }, // Явно указываем массив строк
        userId: currentUserId 
    });
    // Превращаем в Set строк для мгновенного поиска O(1)
    const dislikedPostIds = new Set(
        dislikes.map(d => d.postId?.toString()).filter(Boolean)
    );
    // Возвращаем массив boolean в том же порядке, в котором пришли IDs
    return postIds.map(id => dislikedPostIds.has(id.toString()));
    }),
// Лоадер для количества лайков (агрегация)
    likeCountLoader: new DataLoader(async (postIds: readonly string[]) => {
    const counts = await LikeModel.aggregate([
      { $match: { postId: { $in: postIds.map(id => new mongoose.Types.ObjectId(id)) } } },
      { $group: { _id: "$postId", count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));
    return postIds.map(id => countMap.get(id.toString()) || 0);
  }),

  // Лоадер для количества дизлайков
    dislikeCountLoader: new DataLoader(async (postIds: readonly string[]) => {
    const counts = await DislikeModel.aggregate([
      { $match: { postId: { $in: postIds.map(id => new mongoose.Types.ObjectId(id)) } } },
      { $group: { _id: "$postId", count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));
    return postIds.map(id => countMap.get(id.toString()) || 0);
  }),
// Группировка всех объектов лайков для списка постов
    allLikesLoader: new DataLoader(async (postIds: readonly string[]) => {
        const likes = await LikeModel.find({ postId: { $in: postIds as string[] } });
        // Группируем лайки по postId
        const map: Record<string, any[]> = {};
        likes.forEach(like => {
            const pId = like.postId.toString();
            if (!map[pId]) map[pId] = [];
            map[pId].push(like);
        });
        return postIds.map(id => map[id] || []);
    }),
// Группировка всех объектов лайков для списка постов
    allDislikesLoader: new DataLoader(async (postIds: readonly string[]) => {
        const dislikes = await DislikeModel.find({ postId: { $in: postIds as string[] } });
        // Группируем лайки по postId
        const map: Record<string, any[]> = {};
        dislikes.forEach(dislike => {
            const pId = dislike.postId.toString();
            if (!map[pId]) map[pId] = [];
            map[pId].push(dislike);
        });
        return postIds.map(id => map[id] || []);
    }),
});