import mongoose from "mongoose";
import { Schema, Types } from "mongoose";
import type { InferSchemaType } from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true // Чтобы названия разделов не дублировались
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        unique: true, // Важно для красивых URL на фронтенде
        lowercase: true // Всегда в нижнем регистре для путей
    },
    description: {
        type: String,
        trim: true,
        default: ""
    }
}, { timestamps: true });

export type ICategory = InferSchemaType<typeof categorySchema> & { _id: Types.ObjectId; id: string };
export const CategoryModel = mongoose.model("Category", categorySchema);
