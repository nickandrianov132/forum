import { GraphQLError } from 'graphql';
import type { MyContext } from "../../../index.ts";
import { LikeModel } from "../../models/Likes.ts";
import { PostModel } from "../../models/Posts.ts";
import { UserModel } from "../../models/Users.ts";
import type { Resolvers } from "../../types/resolvers-types.ts";
import { DislikeModel } from '../../models/Dislikes.ts';


const resolvers: Resolvers<MyContext> = {
    Query: {},
    Like: {
        user: async (parent) => {
            const user = await UserModel.findById(parent.userId)
                if (!user) {
                throw new Error("User not found");
                }
            return user
        },
        post: async (parent) => {
            const user = await PostModel.findById(parent.postId)
                if (!user) {
                throw new Error("User not found");
                }
            return user
        }
    },
    Mutation: {
        addLike: async (_, { postId }, context) => {
            const userId = context.userId;
            if (!userId) throw new GraphQLError("Unauthorized");

            // 1. Проверяем наличие лайка
            const existingLike = await LikeModel.findOne({ postId, userId });

            if (existingLike) {
                // Удаляем лайк
                await LikeModel.findByIdAndDelete(existingLike._id);
            } else {
                // Если лайка нет, сначала убираем ДИЗЛАЙК (если он был)
                await DislikeModel.findOneAndDelete({ postId, userId });
                
                // Создаем новый ЛАЙК
                await LikeModel.create({ postId, userId });
            }

            // 2. Возвращаем пост. 
            // ВАЖНО: GraphQL сам вызовет резолверы Post (isLiked, likesCount и т.д.),
            // и лоадеры вернут уже актуальные данные!
            const post = await PostModel.findById(postId);
            if (!post) throw new GraphQLError("Post not found");
            
            return post;
        }
        // addLike: async (_, { postId }, context) => {
        //     const userId = context.userId;
        //     if (!userId) throw new GraphQLError("Invalid credentials");

        //     // 1. Проверяем, есть ли уже ЛАЙК
        //     const existingLike = await LikeModel.findOne({ postId, userId });

        //     if (existingLike) {
        //         // Если лайк уже стоит — убираем его (Unlike)
        //         await LikeModel.findByIdAndDelete(existingLike._id);
        //         return await PostModel.findByIdAndUpdate(
        //             postId,
        //             { $pull: { likes: existingLike._id } },
        //             { new: true }
        //         );
        //     } else {
        //         // --- ЛОГИКА АВТО-ОЧИСТКИ ДИЗЛАЙКА ---
        //         // 2. Ищем, нет ли ДИЗЛАЙКА от этого юзера
        //         const existingDislike = await DislikeModel.findOne({ postId, userId });
                
        //         if (existingDislike) {
        //             // Если есть дизлайк — удаляем его из базы и из поста
        //             await DislikeModel.findByIdAndDelete(existingDislike._id);
        //             await PostModel.findByIdAndUpdate(postId, {
        //                 $pull: { dislikes: existingDislike._id }
        //             });
        //         }

        //         // 3. Создаем новый ЛАЙК
        //         const newLike = await LikeModel.create({ postId, userId });

        //         // 4. Добавляем его в пост
        //         const updatedPost = await PostModel.findByIdAndUpdate(
        //             postId,
        //             { $addToSet: { likes: newLike._id } },
        //             { new: true }
        //         );

        //         if (!updatedPost) throw new Error("Post not found");
        //         return updatedPost;
        //     }
        // }
    }
}

export default resolvers;