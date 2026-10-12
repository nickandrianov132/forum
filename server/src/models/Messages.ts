import mongoose from "mongoose";
import { Schema, Types } from "mongoose";
import type { InferSchemaType } from "mongoose";



const messageSchema = new Schema({
    text: { 
        type: String, 
        required: true
    },
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
},{ timestamps: true }) //  timestamps для дат создания


export type IMessage = InferSchemaType<typeof messageSchema> & { _id: Types.ObjectId; id: string };
export const MessageModel = mongoose.model("Message", messageSchema)