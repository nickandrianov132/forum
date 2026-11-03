import type { MyContext } from "../../../index.ts";
import { CommentModel } from "../../models/Comments.ts";
import type { Resolvers } from "../../types/resolvers-types.ts";
import { authenticated } from "../../utils/authGuard.ts";
import { GraphQLError } from 'graphql';

const resolvers: Resolvers<MyContext> = {
    Query: {
        commentsByPost: async (_, { postId, limit, offset }) => {
            try {
                const [comments, totalCount] = await Promise.all([
                    CommentModel.find({ postId})
                        .sort({ createdAt: -1 })
                        .skip(offset)
                        .limit(limit),
                    CommentModel.countDocuments({ postId })
                ]);

                return {
                    comments,
                    totalCount
                }
            } catch (error) {
                console.error("Comments fetch error:", error);
                throw new Error("Comments download failed!");
            }
        },
    },
    Mutation: {
        createComment: authenticated(async (_, {postId, content }, { userId }) => {
            if (!userId) {
                throw new GraphQLError('Session expired. Please log in again', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            if (!content || content.trim() === "") {
                throw new Error("Comment can`t be empty!");
            }

            const newComment = new CommentModel({
                content: content.trim(),
                postId,
                userId
            })

            await newComment.save();

            return newComment;
        }),
        deleteComment: authenticated(async (_, { id }, { userId }) => {
            if (!userId) {
                throw new GraphQLError('Session expired. Please log in again', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            const result = await CommentModel.findByIdAndDelete(id);
            return !!result;
        }),
        updateComment: authenticated(async (_, { id, content }, { userId }) => {
            if (!userId) {
                throw new GraphQLError('Session expired. Please log in again', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            const comment = await CommentModel.findByIdAndUpdate(id, {content}, { returnDocument: 'after' })
            return comment;
        })
    },
    Comment: {
        id: (parent) => parent._id.toString(),
        
        user: async (parent, _, { loaders }) => {
        if (!parent.userId) return null;
        // Принудительно приводим к any, если сгенерированные типы строго конфликтуют с Mongoose документом
        return await loaders.userLoader.load(parent.userId.toString()) as any;
        },

        likesCount: async (parent, _, { loaders }) => {
            const data = await loaders.commentLikeLoader.load(parent._id.toString());
            return data.count;
        },

        isLiked: async (parent, _, { loaders }) => {
            const data = await loaders.commentLikeLoader.load(parent._id.toString());
            return data.isLiked;
        },

        dislikesCount: async (parent, _, { loaders }) => {
            const data = await loaders.commentDislikeLoader.load(parent._id.toString());
            return data.count;
        },

        isDisliked: async (parent, _, { loaders }) => {
            const data = await loaders.commentDislikeLoader.load(parent._id.toString());
            return data.isDisliked;
        },

        isOwner: (parent, _, { userId }) => {
            if (!userId || !parent.userId) return false;
            return parent.userId.toString() === userId.toString();
        }
    }

};

export default resolvers;