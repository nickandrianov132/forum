import mongoose, { type InferSchemaType } from "mongoose";
import { Schema } from "mongoose";


const dislikeSchema = new Schema({
    // Ссылка на пост
    postId: { type: mongoose.Types.ObjectId, ref: "Post", required: true },
    // Ссылка на автора лайка
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true }
}, {timestamps: true})

// Создаем уникальный индекс, чтобы один юзер не мог лайкнуть пост дважды
dislikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export type IDislike = InferSchemaType<typeof dislikeSchema>
export const DislikeModel = mongoose.model("Dislike", dislikeSchema)