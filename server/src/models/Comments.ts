import mongoose from "mongoose";
import { Schema, Types } from "mongoose";
import type { InferSchemaType } from "mongoose";

const commentSchema = new Schema({
  // Текст комментария
  content: {
    type: String,
    required: true,
    trim: true,
  },
  // Привязка к посту, под которым оставлен комментарий
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  // Автор комментария
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true }); // Автоматически добавит createdAt и updatedAt

export type IComment = InferSchemaType<typeof commentSchema> & { _id: Types.ObjectId; id: string };
export const CommentModel = mongoose.model("Comment", commentSchema);
