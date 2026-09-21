import mongoose from "mongoose";
import { Schema, Types } from "mongoose";
import type { InferSchemaType } from "mongoose";

const userSchema = new Schema({
    login: {type: String, unique: true, required: true},
    password: { type: String, required: true },
    email: {type: String, unique: true, required: true},
    avatar: {type: String, default: "https://bqezaqgwkajiuqvwsuye.supabase.co/storage/v1/object/public/forum-media/avatars/user_icon2.png"},
    postsId: [{ type: mongoose.Types.ObjectId, ref: "Post" }],
    likesId: [{ type: mongoose.Types.ObjectId, ref: "Like" }],
    dislikesId: [{ type: mongoose.Types.ObjectId, ref: "Dislike" }]
})

export type IUser = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId; id: string; avatar: string; };

export const UserModel = mongoose.model("User", userSchema)