import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import path from "path";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Dislike } from "../models/dislike.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { ObjectId } from "mongoose";
import { mongoose } from "mongoose";
const getVideoComments = asyncHandler(async (req, res) => {
    const { video_obj_id } = req.params;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ onVideo: video_obj_id })
        .populate("publisher")
        .populate("likeCount") // number of likes using virtual
        .skip(skip)
        .limit(limit);
    if (!comments) {
        return res.status(300).json({
            success: false,
            message: "error while querying comments"
        });
    }

    const userId = req.user?._id || null;

    if (userId) {
        const commentsWithLikeInfo = await Promise.all(
            comments.map(async (comment) => {
                const isLiked = await Like.exists({
                    onComment: comment._id,
                    user: userId
                });
                //on Dislike schema
                const isDisliked = await Dislike.exists({
                    onComment: comment._id,
                    user: userId
                });
                // this is on Comment schema
                const replyCount = await Comment.countDocuments({
                    onComment: comment._id
                });
                return {
                    ...comment.toObject(),
                    isLiked: !!isLiked,
                    isDisliked: !!isDisliked,
                    replyCount
                };
            })
        );
        return res

            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { comments: commentsWithLikeInfo },
                    "some comments fetched with like info"
                )
            );
    } else {
        const commentsWithReplyCount = await Promise.all(
            comments.map(async (reply) => {
                const replyCount = await Comment.countDocuments({
                    onComment: reply._id
                });
                return {
                    ...reply.toObject(),
                    replyCount
                };
            })
        );
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { comments: commentsWithReplyCount },
                    "some comments fetched"
                )
            );
    }
});

const addComment = asyncHandler(async (req, res) => {
    const { video_obj_id } = req.params;
    const user = req.user;
    const { message } = req.body;

    if (!user) {
        return res.status(303).json({
            success: false,
            message: "login is required to add comments"
        });
    }

    if (!message) {
        return res.status(300).json({
            success: false,
            message: "Message is required to make comment"
        });
    }
    if (!video_obj_id) {
        return res.status(303).json({
            success: false,
            message: "video_obj_id is required to comment on"
        });
    }
    const createdComment = await Comment.create({
        onVideo: video_obj_id,
        message: message,
        publisher: user._id
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { createdComment },
                "comment added successfully"
            )
        );
});

const deleteComment = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(303).json({
            success: false,
            message: "In order to delete this fucking comment, Login is required my friend."
        });
    }
    const { comment_obj_id } = req.params;

    if (!comment_obj_id) {
        return res.status(300).json({
            success: false,
            message: "comment_obj_id is required"
        });
    }
    // if the user is owner of video than grant the fucking permission
    //only valid user can delete comment
    const comment = await Comment.findById(comment_obj_id);
    console.log("comment:", comment);
    if (comment.publisher.toString() !== user._id.toString()) {
        return res.status(300).json({
            success: false,
            message: "You don't have permission to delete this comment"
        });
    }

    const deletedComment = await Comment.deleteOne({ _id: comment_obj_id });

    if (deletedComment.deletedCount === 1) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Comment deleted successfully"));
    } else {
        return res.status(300).json({
            success: false,
            message: "comment not found"
        });
    }
});

const likeComment = asyncHandler(async (req, res) => {
    const user = req.user;
    const { comment_obj_id } = req.params;

    if (!user) {
        return res.status(300).json({
            success: false,
            message: "Login is required to like comments"
        });
    }
    if (!comment_obj_id) {
        return res.status(300).json({
            success: false,
            message: "comment_obj_id is required to like comments"
        });
    }

    const alreadyLiked = await Like.findOne({
        onComment: comment_obj_id,
        user: user._id
    });

    if (!alreadyLiked) {
        const likedComment = await Like.create({
            onComment: comment_obj_id,
            user: user._id
        });
        if (likedComment) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { likedComment },
                        "Comment liked successfully"
                    )
                );
        } else {
            return res.status(300).json({
                success: false,
                message: "Error while creating document for comment like"
            });
        }
    } else {
        const removeLike = await alreadyLiked.deleteOne();
        if (removeLike) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "comment Like removed successfully"
                    )
                );
        } else {
            return res.status(300).json({
                success: false,
                message: "Error while removing already liked document"
            });
        }
    }
});
const dislikeComment = asyncHandler(async (req, res) => {
    const user = req.user;
    const { comment_obj_id } = req.params;

    if (!user) {
        return res.status(300).json({
            success: false,
            message: "Login is required to dislike comments"
        });
    }
    if (!comment_obj_id) {
        return res.status(300).json({
            success: false,
            message: "comment_obj_id is required to dislike comments"
        });
    }

    const alreadyDisliked = await Dislike.findOne({
        onComment: comment_obj_id,
        user: user._id
    });

    if (!alreadyDisliked) {
        const dislikedComment = await Dislike.create({
            onComment: comment_obj_id,
            user: user._id
        });
        if (dislikedComment) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { likeComment },
                        "Comment disliked successfully"
                    )
                );
        } else {
            return res.status(300).json({
                success: false,
                message: "Error while creating document for comment dislike"
            });
        }
    } else {
        const removedDislike = await alreadyDisliked.deleteOne();
        if (removedDislike) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "comment dislike removed successfully"
                    )
                );
        } else {
            return res.status(300).json({
                success: false,
                message: "Error while removing already disliked document"
            });
        }
    }
});

const replyOn = asyncHandler(async (req, res) => {
    const user = req.user;
    const { comment_obj_id } = req.params;
    const { message } = req.body;
    if (!user) {
        return res.status(300).json({
            success: false,
            message: "Login is required to reply on"
        });
    }

    const createdReply = await Comment.create({
        onComment: comment_obj_id,
        publisher: user._id,
        message: message
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { createdReply }, "Reply added successfully")
        );
});
const getReplies = asyncHandler(async (req, res) => {
    const { comment_obj_id } = req.params;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = req.user;

    const replies = await Comment.aggregate([
        { $match: { onComment: new mongoose.Types.ObjectId(comment_obj_id) } },
        { $skip: skip },
        { $limit: limit },

        // Lookup Like by current user on each comment
        {
            $lookup: {
                from: "likes",
                let: { commentId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$onComment", "$$commentId"] },
                                    {
                                        $eq: [
                                            "$user",
                                            new mongoose.Types.ObjectId(
                                                user._id
                                            )
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: "userLike"
            }
        },

        // Lookup Dislike by current user on each comment
        {
            $lookup: {
                from: "dislikes",
                let: { commentId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$onComment", "$$commentId"] },
                                    {
                                        $eq: [
                                            "$user",
                                            new mongoose.Types.ObjectId(
                                                user._id
                                            )
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: "userDislike"
            }
        },

        // Lookup publisher (user) data
        {
            $lookup: {
                from: "users",
                localField: "publisher",
                foreignField: "_id",
                as: "publisherData"
            }
        },
        {
            $unwind: {
                path: "$publisherData",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                publisher: "$publisherData.username"
            }
        },

        // Lookup replies count
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "onComment",
                as: "replies"
            }
        },
        {
            $addFields: {
                repliesCount: { $size: "$replies" }
            }
        },

        // Lookup likes count
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "onComment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },

        // Add fields to indicate like/dislike status
        {
            $addFields: {
                isLiked: { $gt: [{ $size: "$userLike" }, 0] },
                isDisliked: { $gt: [{ $size: "$userDislike" }, 0] }
            }
        },

        // Clean up
        {
            $project: {
                _id: 1,
                message: 1,
                createdAt: 1,
                updatedAt: 1,
                publisher: 1,
                isLiked: 1,
                isDisliked: 1,
                message: 1,
                repliesCount: 1,
                likesCount: 1
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { replies: replies },
                "Some replies are fetched"
            )
        );
});
const getPostComments = asyncHandler(async (req, res) => {
    const { post_id } = req.params;
    const user = req.user;

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!post_id) {
        return res.status(300).json({
            success: false,
            message: "Where is fucking post_id eh?"
        });
    }

    const comments = await Comment.aggregate([
        { $match: { onPost: new mongoose.Types.ObjectId(post_id) } },
        { $skip: skip },
        { $limit: limit },

        // Lookup Like by current user on each comment
        {
            $lookup: {
                from: "likes",
                let: { commentId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$onComment", "$$commentId"] },
                                    {
                                        $eq: [
                                            "$user",
                                            new mongoose.Types.ObjectId(
                                                user._id
                                            )
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: "userLike"
            }
        },

        // Lookup Dislike by current user on each comment
        {
            $lookup: {
                from: "dislikes",
                let: { commentId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$onComment", "$$commentId"] },
                                    {
                                        $eq: [
                                            "$user",
                                            new mongoose.Types.ObjectId(
                                                user._id
                                            )
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: "userDislike"
            }
        },

        // Lookup publisher (user) data
        {
            $lookup: {
                from: "users",
                localField: "publisher",
                foreignField: "_id",
                as: "publisherData"
            }
        },
        {
            $unwind: {
                path: "$publisherData",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                publisher: "$publisherData.username"
            }
        },

        // Lookup replies count
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "onComment",
                as: "replies"
            }
        },
        {
            $addFields: {
                repliesCount: { $size: "$replies" }
            }
        },

        // Lookup likes count
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "onComment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },

        // Add fields to indicate like/dislike status
        {
            $addFields: {
                isLiked: { $gt: [{ $size: "$userLike" }, 0] },
                isDisliked: { $gt: [{ $size: "$userDislike" }, 0] }
            }
        },

        // Clean up
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                publisher: 1,
                isLiked: 1,
                isDisliked: 1,
                message: 1,
                repliesCount: 1,
                likesCount: 1
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, { comments }, "Some comments fetched"));
});
export {
    getVideoComments,
    likeComment,
    addComment,
    deleteComment,
    dislikeComment,
    replyOn,
    getReplies,
    getPostComments
};
