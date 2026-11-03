import mongoose from "mongoose";
import { Schema, Types } from "mongoose";
import type { InferSchemaType } from "mongoose";

const commentLikeSchema = new Schema({
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

// Уникальный составной индекс: один юзер — один лайк на комментарий
commentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export type ICommentLike = InferSchemaType<typeof commentLikeSchema> & { _id: Types.ObjectId; id: string };
export const CommentLikeModel = mongoose.model("CommentLike", commentLikeSchema);
