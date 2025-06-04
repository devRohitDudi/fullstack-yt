import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoURL: {
            type: String, //cloudinary URL
            required: true
        },
        videoAssetId: {
            type: String, //cloudinary asses_id
            required: true
        },
        title: {
            type: String,
            required: true,
            min: 3,
            max: 100
        },
        description: {
            type: String,
            min: 3,
            max: 500
        },
        thumbnail1: {
            type: String, //cloudinary URL
            required: true
        },
        thumbnail2: {
            type: String //cloudinary URL
        },
        thumbnail3: {
            type: String //cloudinary URL
        },
        duration: {
            type: Number, //cloudinary URL
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Likes"
            }
        ],

        dislikes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "dislikes"
            }
        ],
        visibility: {
            type: String,
            enum: ["public", "private", "unlisted"],
            default: "public"
        },
        tags: {
            type: [String],
            default: []
        },
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Comment"
            }
        ],

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
