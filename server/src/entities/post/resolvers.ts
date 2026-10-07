import type { MyContext } from "../../../index.ts";
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
        posts: async (_, { limit, offset }) => {
            const [posts, totalCount] = await Promise.all([
                PostModel.find()
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .lean(),
                PostModel.countDocuments()
            ]);

            return {
                posts: posts.map((post) => ({
                    ...post,
                    id: post._id.toString()
                })),
                totalCount
            }
        },
        postsByCategory: async (_, { slug, limit, offset }) => {
            try {
                const { CategoryModel } = await import("../../models/Category.ts");
                
                // 1. Сначала находим саму категорию по красивой строке из URL
                const category = await CategoryModel.findOne({ slug }).lean();
                
                // Если категория не найдена, возвращаем пустую страницу (защита от краша)
                if (!category) {
                    return { posts: [], totalCount: 0 };
                }

                // 2. Ищем посты по реальному ObjectId найденной категории
                const [posts, totalCount] = await Promise.all([
                    PostModel.find({ category: category._id })
                        .sort({ createdAt: -1 })
                        .skip(offset || 0)
                        .limit(limit || 5)
                        .lean(),
                    PostModel.countDocuments({ category: category._id })
                ]);

                return {
                    posts: (posts || []).map((post) => ({
                        ...post,
                        id: post._id.toString()
                    })),
                    totalCount: totalCount ?? 0 // 100% защита от null
                }

            } catch (error) {
                console.error("Resolver error postsByCategory:", error);
                return { posts: [], totalCount: 0 }
            }
        }
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