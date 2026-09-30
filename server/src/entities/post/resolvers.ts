import type { MyContext } from "../../../index.ts";
import { DislikeModel } from "../../models/Dislikes.ts";
import { LikeModel } from "../../models/Likes.ts";
import { PostModel } from "../../models/Posts.ts";
import { UserModel } from "../../models/Users.ts";
import type { Resolvers } from "../../types/resolvers-types.ts";
import { PubSub } from "graphql-subscriptions";
import { authenticated } from "../../utils/authGuard.ts";
const pubsub = new PubSub()

const resolvers: Resolvers<MyContext> = {
    Query: {
        user: async (_, {id}) => UserModel.findById(id),
        post: async (_, {id}) => await PostModel.findById(id),
        posts: async () => await PostModel.find(),
    },
    Mutation: {
        // Заменили topic на categoryId
        createPost: authenticated( async (_, {categoryId, title, content, userId}) => {
            const newPost = new PostModel({
                category: categoryId, // Передаем ID категории в Mongoose модель
                title, 
                content, 
                userId
            })
            await newPost.save()
            const posts = await PostModel.find()
            pubsub.publish("POSTS_RENEW", { postsSub: posts})
            return newPost
        }),
        updatePost: authenticated( async (_, {id, ...args}) => {
            const post = await PostModel.findByIdAndUpdate(id, args, {new: true})
            return post
        }),
        deletePost: authenticated( async (_, {id}) => {
            const result = await PostModel.findByIdAndDelete(id)
            const posts = await PostModel.find()
            pubsub.publish("POSTS_RENEW", { postsSub: posts})
            return !!result
        }),
    },
    Post: {
        // ДОБАВЛЕНО: Резолвер поля category для типа Post
        category: async (parent, _, { loaders }) => {
            // Применяем .toString() к ID категории из базы данных
            const category = await loaders.categoryLoader.load(parent.category.toString());
            if (!category) throw new Error("Category not found");
            return category;
        },

        user: async (parent, _, { loaders }) => {
            const user = await loaders.userLoader.load(parent.userId.toString());
            if (!user) throw new Error("User not found");
            return user;
        },

        likesCount: (parent, _, { loaders }) => {
            return loaders.likeCountLoader.load(parent.id.toString());
        },

        dislikesCount: (parent, _, { loaders }) => {
            return loaders.dislikeCountLoader.load(parent.id.toString());
        },

        isLiked: (parent, _, { loaders }) => {
            return loaders.likeLoader.load(parent.id.toString());
        },

        isDisliked: (parent, _, { loaders }) => {
            return loaders.dislikeLoader.load(parent.id.toString());
        },

        isOwner: (parent, _, { userId }) => {
        console.log("Parent Post userId:", parent.userId);
        console.log("Current Context userId:", userId);
        
        if (!userId || !parent.userId) {
            return false; 
        }
        
        return parent.userId.toString() === userId.toString();
        },
    }
    
}

export default resolvers;