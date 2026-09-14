import type { MyContext } from "../../../index.ts";
import { CategoryModel } from "../../models/Category.ts";
import { PostModel } from "../../models/Posts.ts";
import type { Resolvers } from "../../types/resolvers-types.ts";
import { authenticated } from "../../utils/authGuard.ts";

const resolvers: Resolvers<MyContext> = {
    Query: {
        categories: async () => await CategoryModel.find(),
        category: async (_, { id }) => await CategoryModel.findById(id),
        categoryBySlug: async (_, { slug }) => await CategoryModel.findOne({ slug }),
        postsByCategory: async (_, { categoryId }) => await PostModel.find({ category: categoryId })
    },
    Category: {
        posts: async (parent) => {
            // Загружаем посты, у которых поле category совпадает с ID текущей категории
            return await PostModel.find({ category: parent.id.toString() });
        }
    },
    Mutation: {
        // Создание категорий (например, доступно только админу, или пока просто авторизованному)
        createCategory: authenticated(async (_, { name, slug, description }) => {
            const newCategory = new CategoryModel({ name, slug, description });
            return await newCategory.save();
        })
    }
};

export default resolvers;