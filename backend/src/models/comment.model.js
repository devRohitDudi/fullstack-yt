import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema(
    {
        onVideo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },
        onPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        },
        onComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        },
        message: {
            type: String,
            required: true
        },
        publisher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);
commentSchema.virtual("likesCount", {
    ref: "Like",
    localField: "_id",
    foreignField: "onComment",
    count: true // 👈 this is the key part: just count, don't fetch docs
});
commentSchema.set("toObject", { virtuals: true });
commentSchema.set("toJSON", { virtuals: true });

export const Comment = mongoose.model("comment", commentSchema);
