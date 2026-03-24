import { GraphQLError } from "graphql";
import { DislikeModel } from "../../models/Dislikes.ts";
import { PostModel } from "../../models/Posts.ts";
import { UserModel } from "../../models/Users.ts";
import type { Resolvers } from "../../types/resolvers-types.ts";
import type { MyContext } from "../../../index.ts";
import { LikeModel } from "../../models/Likes.ts";

const resolvers: Resolvers<MyContext> = {
    Query: {},
    Dislike: {
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
        addDislike: async (_, { postId }, context) => {
        const userId = context.userId;
        if (!userId) throw new GraphQLError("Unauthorized");

        // 1. Проверяем, стоит ли уже дизлайк
        const existingDislike = await DislikeModel.findOne({ postId, userId });

        if (existingDislike) {
            // Если дизлайк есть — просто удаляем его (Toggle off)
            await DislikeModel.findByIdAndDelete(existingDislike._id);
        } else {
            // Если дизлайка нет:
            // Сначала удаляем ЛАЙК от этого юзера (если он был), чтобы не было конфликта
            await LikeModel.findOneAndDelete({ postId, userId });
            
            // Создаем новый ДИЗЛАЙК
            await DislikeModel.create({ postId, userId });
        }

        // 2. Находим и возвращаем пост
        const post = await PostModel.findById(postId);
        if (!post) throw new GraphQLError("Post not found");
        
        // Apollo Client получит этот объект, увидит изменения в 
        // isLiked, isDisliked, likesCount, dislikesCount и обновит UI
        return post;
        }



        // addDislike: async (_, { postId }, context) => {
        //     const userId = context.userId;
        //     if (!userId) throw new GraphQLError("Invalid credentials");

        //     // 1. Проверяем, есть ли уже ДИЗЛАЙК
        //     const existingDislike = await DislikeModel.findOne({ postId, userId });

        //     if (existingDislike) {
        //         // Если ДИЗЛАЙК уже стоит — убираем его (Undislike)
        //         await DislikeModel.findByIdAndDelete(existingDislike._id);
        //         return await PostModel.findByIdAndUpdate(
        //             postId,
        //             { $pull: { dislikes: existingDislike._id } },
        //             { new: true }
        //         );
        //     } else {
        //         // --- ЛОГИКА АВТО-ОЧИСТКИ ЛАЙКА ---
        //         // 2. Ищем, нет ли ЛАЙКА от этого юзера
        //         const existingLike = await LikeModel.findOne({ postId, userId });
                
        //         if (existingLike) {
        //             // Если есть — удаляем его из базы и из поста
        //             await LikeModel.findByIdAndDelete(existingLike._id);
        //             await PostModel.findByIdAndUpdate(postId, {
        //                 $pull: { likes: existingLike._id }
        //             });
        //         }

        //         // 3. Создаем новый ДИЗЛАЙК
        //         const newDislike = await DislikeModel.create({ postId, userId });

        //         // 4. Добавляем его в пост
        //         const updatedPost = await PostModel.findByIdAndUpdate(
        //             postId,
        //             { $addToSet: { dislikes: newDislike._id } },
        //             { new: true }
        //         );

        //         if (!updatedPost) throw new Error("Post not found");
        //         return updatedPost;
        //     }

        // }
    }
}

export default resolvers;