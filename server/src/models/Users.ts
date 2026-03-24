import mongoose from "mongoose";
import { Schema, Types } from "mongoose";
import type { InferSchemaType } from "mongoose";

const userSchema = new Schema({
    login: {type: String, unique: true},
    password: String,
    email: {type: String, unique: true},
    postsId: [{ type: mongoose.Types.ObjectId, ref: "Post" }],
    likesId: [{ type: mongoose.Types.ObjectId, ref: "Like" }],
    dislikesId: [{ type: mongoose.Types.ObjectId, ref: "Dislike" }]
})

export type IUser = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId; id: string };

export const UserModel = mongoose.model("User", userSchema)