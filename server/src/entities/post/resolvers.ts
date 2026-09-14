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
            if (!userId || !parent.userId) return false;
            return parent.userId.toString() === userId.toString();
        },
    }

    // Query: {
    //     user: async (_, {id}) => UserModel.findById(id),
    //     post: async (_, {id}) => await PostModel.findById(id),
    //     posts: async () => await PostModel.find(),
    //     // postsByTopic: async (_, {topic}) => await PostModel.find({topic})
    // },
    // Mutation: {
    //     createPost: authenticated( async (_, {topic, title, content, userId}) => {
    //         const newPost = new PostModel({
    //             topic, title, content, userId
    //         })
    //         await newPost.save()
    //         const posts = await PostModel.find()
    //         pubsub.publish("POSTS_RENEW", { postsSub: posts})
    //         // pubsub.publish("POST_CREATED", { postCreated: newPost})
    //         return newPost
    //     }),
    //     updatePost: authenticated( async (_, {id, ...args}) => {
    //         const post = await PostModel.findByIdAndUpdate(id, args, {new: true})
    //         return post
    //     }),
    //     deletePost: authenticated( async (_, {id}) => {
    //         const result = await PostModel.findByIdAndDelete(id)
    //         const posts = await PostModel.find()
    //         pubsub.publish("POSTS_RENEW", { postsSub: posts})
    //         return !!result
    //     }),
    // },
    // Post: {
    //     // 1. Исправляем для загрузки автора
    //     user: async (parent, _, { loaders }) => {
    //         // Добавляем .toString(), чтобы превратить ObjectId в string
    //         const user = await loaders.userLoader.load(parent.userId.toString());
    //         if (!user) throw new Error("User not found");
    //         return user;
    //     },

    //     // 2. Исправляем для счетчиков и лайков
    //     likesCount: (parent, _, { loaders }) => {
    //         // parent.id в Mongoose обычно уже строка или ObjectId, 
    //         // но .toString() делает это безопасным для TS
    //         return loaders.likeCountLoader.load(parent.id.toString());
    //     },

    //     dislikesCount: (parent, _, { loaders }) => {
    //         return loaders.dislikeCountLoader.load(parent.id.toString());
    //     },

    //     isLiked: (parent, _, { loaders }) => {
    //         return loaders.likeLoader.load(parent.id.toString());
    //     },

    //     isDisliked: (parent, _, { loaders }) => {
    //         return loaders.dislikeLoader.load(parent.id.toString());
    //     },

    //     // 3. Для isOwner (сравнение двух ID)
    //     isOwner: (parent, _, { userId }) => {
    //         if (!userId || !parent.userId) return false;
    //         // Всегда сравниваем через .toString()
    //         return parent.userId.toString() === userId.toString();
    //     },
    // }

    // Post: {
    //     user: async (parent) => {
    //         const user = await UserModel.findById(parent.userId);
    //         if (!user) {
    //             throw new Error("User not found");
    //         }
    //         return user; // Теперь TS видит, что возвращается только User, без null
    //     },
    //     likesCount: async (parent) => await LikeModel.countDocuments({postId: parent.id}),
    //     dislikesCount: async (parent) => await DislikeModel.countDocuments({postId: parent.id}),
    //     isLiked: async (parent, _, context) => {
    //         if (!context.userId) return false;
    //         // Ищем в коллекции лайков запись с нужным postId и userId
    //         const like = await LikeModel.findOne({ 
    //             postId: parent.id, 
    //             userId: context.userId 
    //         });
            
    //         return !!like; // Превращаем объект (или null) в true/false
    //     },
    //     isDisliked: async (parent, _, context) => {
    //         if (!context.userId) return false;
    //         const dislike = await DislikeModel.findOne({ 
    //         postId: parent.id, 
    //         userId: context.userId 
    //     });
        
    //     return !!dislike; // Превращаем объект (или null) в true/false
    //     },
    //     isOwner: async (parent, _, context) => {
    //         const parentId = parent.userId?.toString();
    //         const contextId = context.userId?.toString();
    //         if (!contextId || !parentId) {
    //             return false;
    //         }
    //         const match = parentId === contextId;
    //         return match;
    //     },
    // }
    
}

export default resolvers;