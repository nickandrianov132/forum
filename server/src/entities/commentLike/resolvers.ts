import { GraphQLError } from 'graphql';
import type { MyContext } from "../../../index.ts";
import type { Resolvers } from "../../types/resolvers-types.ts";
import { authenticated } from '../../utils/authGuard.ts';
import { CommentLikeModel } from '../../models/CommentLikes.ts';
import { CommentDislikeModel } from '../../models/CommentDislikes.ts';
import { CommentModel } from '../../models/Comments.ts';
import { UserModel } from '../../models/Users.ts';


const resolvers: Resolvers<MyContext> = {
  Query: {},
  
  CommentLike: {
    user: async (parent, _, { loaders }) => {
      if (!parent.userId) return null;
      // Принудительно приводим к any, если сгенерированные типы строго конфликтуют с Mongoose документом
      return await loaders.userLoader.load(parent.userId.toString()) as any;
    },
    // user: async (parent) => {
    //     const user = await UserModel.findById(parent.userId)
    //         if (!user) {
    //         throw new Error("User not found");
    //         }
    //     return user
    // },
    comment: async (parent) => {
      const comment = await CommentModel.findById(parent.commentId);
      if (!comment) {
        throw new Error("Comment not found");
      }
      return comment;
    }
  },

  Mutation: {
    addCommentLike: authenticated(async (_, { commentId }, context) => {
      const userId = context.userId; // или context.user.id в зависимости от вашей типизации MyContext

      if (!userId) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      // Проверяем, стоит ли уже лайк от этого пользователя
      const existingLike = await CommentLikeModel.findOne({ commentId, userId });

      if (existingLike) {
        // Если лайк уже был — убираем его (toggle-эффект)
        await CommentLikeModel.findByIdAndDelete(existingLike._id);
      } else {
        // Если лайка не было — убираем дизлайк (если он стоял) и создаем лайк
        await CommentDislikeModel.findOneAndDelete({ commentId, userId });
        await CommentLikeModel.create({ commentId, userId });
      }

      // Находим комментарий, чтобы вернуть его на фронтенд с актуальными данными
      const comment = await CommentModel.findById(commentId);
      if (!comment) {
        throw new GraphQLError("Comment not found", {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      return comment;
    })
  }
};

export default resolvers;