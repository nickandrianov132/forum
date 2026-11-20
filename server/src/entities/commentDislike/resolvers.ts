import { GraphQLError } from 'graphql';
import type { MyContext } from "../../../index.ts";
import type { Resolvers } from "../../types/resolvers-types.ts";
import { authenticated } from '../../utils/authGuard.ts';
import { CommentModel } from '../../models/Comments.ts';
import { CommentDislikeModel } from '../../models/CommentDislikes.ts';
import { CommentLikeModel } from '../../models/CommentLikes.ts';


const resolvers: Resolvers<MyContext> = {
  Query: {},
  
  CommentLike: {
    user: async (parent, _, { loaders }) => {
      if (!parent.userId) return null;
      // Принудительно приводим к any, если сгенерированные типы строго конфликтуют с Mongoose документом
      return await loaders.userLoader.load(parent.userId.toString()) as any;
    },
    comment: async (parent) => {
      const comment = await CommentModel.findById(parent.commentId);
      if (!comment) {
        throw new Error("Comment not found");
      }
      return comment;
    }
  },

  Mutation: {
    addCommentDislike: authenticated(async (_, { commentId }, context) => {
      const userId = context.userId; // или context.user.id в зависимости от вашей типизации MyContext

      if (!userId) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      // Проверяем, стоит ли уже дизлайк от этого пользователя
      const existingDislike = await CommentDislikeModel.findOne({ commentId, userId });

      if (existingDislike) {
        // Если дизлайк уже был — убираем его (toggle-эффект)
        await CommentDislikeModel.findByIdAndDelete(existingDislike._id);
      } else {
        // Если дизлайк не было — убираем лайк (если он стоял) и создаем дизлайк
        await CommentLikeModel.findOneAndDelete({ commentId, userId });
        await CommentDislikeModel.create({ commentId, userId });
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