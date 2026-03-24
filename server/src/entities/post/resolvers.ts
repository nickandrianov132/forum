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
        posts: async () => await PostModel.find()
    },
    Mutation: {
        createPost: authenticated( async (_, {title, content, userId}) => {
            const newPost = new PostModel({
                title, content, userId
            })
            await newPost.save()
            const posts = await PostModel.find()
            pubsub.publish("POSTS_RENEW", { postsSub: posts})
            // pubsub.publish("POST_CREATED", { postCreated: newPost})
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
    // Post: {
    //     user: async (parent, _, { loaders }) => {
    //         const user = await loaders.userLoader.load(parent.userId);
    //         if (!user) throw new Error("User not found");
    //         return user;
    //     },
    //     // Используем новые лоадеры для списков
    //     likes: (parent, _, { loaders }) => loaders.allLikesLoader.load(parent.id),
    //     dislikes: (parent, _, { loaders }) => loaders.allDislikesLoader.load(parent.id),
        
    //     // Остальные поля через ваши лоадеры (как вы и написали)
    //     likesCount: (parent, _, { loaders }) => loaders.likeCountLoader.load(parent.id),
    //     dislikesCount: (parent, _, { loaders }) => loaders.dislikeCountLoader.load(parent.id),
    //     isLiked: (parent, _, { loaders }) => loaders.likeLoader.load(parent.id),
    //     isDisliked: (parent, _, { loaders }) => loaders.dislikeLoader.load(parent.id),
    // }
    Post: {
        // user: async (parent) => await UserModel.findById(parent.userId),
        user: async (parent) => {
            const user = await UserModel.findById(parent.userId);
            if (!user) {
                throw new Error("User not found");
            }
            return user; // Теперь TS видит, что возвращается только User, без null
        },
        // likes: async (parent) => {
        // // Находим все лайки для этого поста
        // return await LikeModel.find({ postId: parent.id });
        // },
        // dislikes: async (parent) => await DislikeModel.find({postId: parent.id}),
        likesCount: async (parent) => await LikeModel.countDocuments({postId: parent.id}),
        dislikesCount: async (parent) => await DislikeModel.countDocuments({postId: parent.id}),
        isLiked: async (parent, _, context) => {
            if (!context.userId) return false;
            // Ищем в коллекции лайков запись с нужным postId и userId
            const like = await LikeModel.findOne({ 
                postId: parent.id, 
                userId: context.userId 
            });
            
            return !!like; // Превращаем объект (или null) в true/false
        },
        isDisliked: async (parent, _, context) => {
            if (!context.userId) return false;
            const dislike = await DislikeModel.findOne({ 
            postId: parent.id, 
            userId: context.userId 
        });
        
        return !!dislike; // Превращаем объект (или null) в true/false
        },
        isOwner: async (parent, _, context) => {
            const parentId = parent.userId?.toString();
            const contextId = context.userId?.toString();
            if (!contextId || !parentId) {
                return false;
            }
            const match = parentId === contextId;
            return match;
        },
    }
    
}

export default resolvers;