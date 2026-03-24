import mongoose from "mongoose";
import { Schema, Types } from "mongoose";
import type { InferSchemaType } from "mongoose";



const postSchema = new Schema({
    title: String,
    content: String,
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    // likes: [{ type: mongoose.Types.ObjectId, ref: "Like"}],
    // dislikes: [{ type: mongoose.Types.ObjectId, ref: "Dislike"}]
})


export type IPost = InferSchemaType<typeof postSchema> & { _id: Types.ObjectId; id: string };
export const PostModel = mongoose.model("Post", postSchema)