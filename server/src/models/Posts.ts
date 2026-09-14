import mongoose from "mongoose";
import { Schema, Types } from "mongoose";
import type { InferSchemaType } from "mongoose";



const postSchema = new Schema({
    // ИЗМЕНЕНО:  привязываем пост к ObjectId модели Category
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Category", 
        required: true 
    },
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    content: { 
        type: String, 
        required: true,
        // Если пост создается без контента, сохраняем пустую структуру Lexical
        default: '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}'
    },
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    // likes: [{ type: mongoose.Types.ObjectId, ref: "Like"}],
    // dislikes: [{ type: mongoose.Types.ObjectId, ref: "Dislike"}]
},{ timestamps: true }) // Рекомендую добавить timestamps для дат создания/обновления


export type IPost = InferSchemaType<typeof postSchema> & { _id: Types.ObjectId; id: string };
export const PostModel = mongoose.model("Post", postSchema)