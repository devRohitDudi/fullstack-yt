import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        images: {
            type: [String],
            default: []
        }
    },
    { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
