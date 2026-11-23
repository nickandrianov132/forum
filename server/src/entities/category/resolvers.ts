import type { MyContext } from "../../../index.ts";
import { CategoryModel } from "../../models/Category.ts";
import { CommentDislikeModel } from "../../models/CommentDislikes.ts";
import { CommentLikeModel } from "../../models/CommentLikes.ts";
import { CommentModel } from "../../models/Comments.ts";
import { DislikeModel } from "../../models/Dislikes.ts";
import { LikeModel } from "../../models/Likes.ts";
import { PostModel } from "../../models/Posts.ts";
import type { Resolvers } from "../../types/resolvers-types.ts";
import { hasRole } from "../../utils/authGuard.ts";
import { GraphQLError } from 'graphql';

const resolvers: Resolvers<MyContext> = {
    Query: {
        categories: async () => await CategoryModel.find(),
        category: async (_, { id }) => await CategoryModel.findById(id),
        categoryBySlug: async (_, { slug }) => await CategoryModel.findOne({ slug }),
        // postsByCategory: async (_, { categoryId }) => await PostModel.find({ category: categoryId })
    },
    Category: {
        posts: async (parent) => {
            // Загружаем посты, у которых поле category совпадает с ID текущей категории
            return await PostModel.find({ category: parent.id.toString() });
        }
    },
    Mutation: {
        // Создание категорий (например, доступно только админу, или модератору)
        createCategory: hasRole(['Admin', 'Moderator']) (
            async (_, { name, slug, description, isAdminOnly }) => {
            const newCategory = new CategoryModel({ name, slug, description, isAdminOnly });
            return await newCategory.save();
        }),
        deleteCategory: hasRole(['Admin']) (
            async (_, { id }) => {
                const category = await CategoryModel.findById(id);
                if (!category) {
                    throw new GraphQLError('Category not found!', {
                        extensions: { code: 'NOT_FOUND' }
                    })
                }

                const posts = await PostModel.find({ category: id }).select('_id');
                const postIds = posts.map((post) => post._id);

                if (postIds.length > 0) {
                    const comments = await CommentModel.find({ postId: { $in: postIds } }).select('_id');
                    const commentIds = comments.map((comment) => comment._id);

                    await Promise.all([
                        commentIds.length > 0 ? CommentLikeModel.deleteMany({ commentId: { $in: commentIds } }) : null,
                        commentIds.length > 0 ? CommentDislikeModel.deleteMany({ commentId: { $in: commentIds } }) : null,
                        LikeModel.deleteMany({ postId: { $in: postIds } }),
                        DislikeModel.deleteMany({ postId: { $in: postIds } }),
                        CommentModel.deleteMany({ postId: { $in: postIds } }),
                        PostModel.deleteMany({ category: id }),
                    ]);
                }

                await CategoryModel.findByIdAndDelete(id);
                return id;
            }
        )
    }
};

export default resolvers;