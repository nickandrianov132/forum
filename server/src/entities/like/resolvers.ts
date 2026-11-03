import { GraphQLError } from 'graphql';
import type { MyContext } from "../../../index.ts";
import { LikeModel } from "../../models/Likes.ts";
import { PostModel } from "../../models/Posts.ts";
import { UserModel } from "../../models/Users.ts";
import type { Resolvers } from "../../types/resolvers-types.ts";
import { DislikeModel } from '../../models/Dislikes.ts';
import { authenticated } from '../../utils/authGuard.ts';


const resolvers: Resolvers<MyContext> = {
    Query: {},
    Like: {
        // user: async (parent) => {
        //     const user = await UserModel.findById(parent.userId)
        //         if (!user) {
        //         throw new Error("User not found");
        //         }
        //     return user
        // },
        user: async (parent, _, { loaders }) => {
        if (!parent.userId) return null;
        // Принудительно приводим к any, если сгенерированные типы строго конфликтуют с Mongoose документом
        return await loaders.userLoader.load(parent.userId.toString()) as any;
        },
        post: async (parent) => {
            const post = await PostModel.findById(parent.postId)
                if (!post) {
                    throw new Error("Post not found");
                }
            return post
        }
    },
    Mutation: {
        addLike: authenticated(async (_, { postId }, context) => {

            const userId = context.userId; 
                // TS поймет, что ниже по коду userId — это только string
            if (!userId) throw new GraphQLError("Unauthorized", { 
                extensions: { code: 'UNAUTHENTICATED' } 
            });
            const existingLike = await LikeModel.findOne({ postId, userId });

            if (existingLike) {
                await LikeModel.findByIdAndDelete(existingLike._id);
            } else {
                await DislikeModel.findOneAndDelete({ postId, userId });
                await LikeModel.create({ postId, userId });
            }

            const post = await PostModel.findById(postId);
            if (!post) throw new GraphQLError("Post not found");
            
            return post;
        })
    }
}

export default resolvers;