import mongoose from "mongoose";
const playlistSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        videos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        description: {
            type: String,
            default: ""
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        visibility: {
            type: String,
            enum: ["public", "private", "unlisted"],
            default: "private"
        }
    },
    { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
