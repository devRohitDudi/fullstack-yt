import mongoose, { mongo } from "mongoose";

const likesSchema = new mongoose.Schema(
    {
        onVideo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },
        onComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        },
        onPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

export const Like = mongoose.model("Like", likesSchema);
