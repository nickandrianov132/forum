import mongoose from "mongoose";
import { Schema, Types } from "mongoose";
import type { InferSchemaType } from "mongoose";

const commentDislikeSchema = new Schema({
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

// Уникальный составной индекс: один юзер — один дизлайк на комментарий
commentDislikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export type ICommentDislike = InferSchemaType<typeof commentDislikeSchema> & { _id: Types.ObjectId; id: string };
export const CommentDislikeModel = mongoose.model("CommentDislike", commentDislikeSchema);
