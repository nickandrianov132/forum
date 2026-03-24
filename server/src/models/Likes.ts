import mongoose, { type InferSchemaType } from "mongoose";
import { Schema } from "mongoose";


const likeSchema = new Schema({
    // Ссылка на пост
    postId: { type: mongoose.Types.ObjectId, ref: "Post", required: true },
    // Ссылка на автора лайка
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true }
}, {timestamps: true})

// Создаем уникальный индекс, чтобы один юзер не мог лайкнуть пост дважды
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export type ILike = InferSchemaType<typeof likeSchema>
export const LikeModel = mongoose.model("Like", likeSchema)