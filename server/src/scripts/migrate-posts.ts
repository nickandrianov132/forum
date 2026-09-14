import mongoose from "mongoose";
import { CategoryModel } from "../models/Category.ts";
import { PostModel } from "../models/Posts.ts";

//  подключения к MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

async function runMigration() {
    try {
        console.log("⏳ Подключение к базе данных...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Успешно подключено к MongoDB.");

        // 1. Ищем или создаем дефолтную категорию для старых постов
        let defaultCategory = await CategoryModel.findOne({ slug: "off-topic" });

        if (!defaultCategory) {
            console.log("✨ Создаем дефолтную категорию 'Флудилка'...");
            defaultCategory = new CategoryModel({
                name: "Off-Topic",               // Имя для отображения на фронтенде
                slug: "off-topic",               // URL-friendly идентификатор
                description: "Раздел для свободного общения обо всем на свете (сюда перенесены старые посты)"
            });
            await defaultCategory.save();
            console.log(`✅ Категория 'Флудилка' создана с ID: ${defaultCategory.id}`);
        } else {
            console.log(`ℹ️ Найдена существующая категория с ID: ${defaultCategory.id}`);
        }

        // 2. Ищем посты, у которых поле 'category' не является валидным ObjectId
        // (это значит, что там либо старая строка topic, либо поля вообще нет)
        const allPosts = await PostModel.find();
        const postsToMigrate = allPosts.filter(post => {
            // Если поля category нет или это не ObjectId Mongoose
            return !post.category || !mongoose.Types.ObjectId.isValid(post.category.toString());
        });

        if (postsToMigrate.length === 0) {
            console.log("🎉 Все посты уже имеют корректную привязку к категориям. Миграция не требуется!");
            return;
        }

        console.log(`📦 Найдено постов для миграции: ${postsToMigrate.length}`);

        // 3. Обновляем посты пачкой
        let updatedCount = 0;
        for (const post of postsToMigrate) {
            // Приводим к any, чтобы обойти строгие проверки типов TS во время миграции
            const rawPost = post as any;
            
            // Если хотим сохранить имя старого топика, можно записать его в title или логи
            // console.log(`Мигрируем пост "${post.title}" (старый топик: ${rawPost.topic})`);

            await PostModel.findByIdAndUpdate(post._id, {
                $set: { category: defaultCategory._id },
                $unset: { topic: "" } // Удаляем старое поле topic из документа MongoDB полностью
            });
            updatedCount++;
        }

        console.log(`🏁 Миграция успешно завершена! Обновлено постов: ${updatedCount}`);

    } catch (error) {
        console.error("❌ Ошибка во время выполнения миграции:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Отключено от базы данных.");
        process.exit(0);
    }
}

runMigration();