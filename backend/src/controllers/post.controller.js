import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Dislike } from "../models/dislike.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import mongoose from "mongoose";

const createPost = asyncHandler(async (req, res) => {
    const user = req.user;
    const { content } = req.body;

    if (!user) {
        throw new ApiError("Login is required to post content");
    }
    if (!content) {
        throw new ApiError("Content is required to do post");
    }

    const photosCount = req.files ? req.files.length : 0;

    //printing 2
    console.log("photos count is:", photosCount);
    let uploadedPhotos = [];
    if (photosCount > 0) {
        for (let i = 0; i < photosCount; i++) {
            const photo = await uploadOnCloudinary(req.files[i].path);
            console.log("photo.url is:", photo?.url);
            uploadedPhotos.push(photo.url);
        }
        const createdPost = await Post.create({
            content: content,
            owner: user._id,
            images: uploadedPhotos
        });
        if (!createdPost) {
            throw new ApiError("Error occured while creating post");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, { createdPost }, "Post created success!")
            );
    } else {
        const createdPost = await Post.create({
            content: content,
            owner: user._id
        });
        if (!createdPost) {
            throw new ApiError("Error occured while creating post");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, { createdPost }, "Post created success!")
            );
    }
});

const getChannelPosts = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (!username) {
        throw new ApiError("username is required to get posts");
    }

    const channel = await User.findOne({ username: username });

    if (!channel) {
        throw new ApiError("requested channel does not exist");
    }
    const posts = await Post.find({ owner: channel._id }).limit(20).lean();

    if (!posts) {
        throw new ApiError("can't fetch posts! maybe invalid _id.");
    }

    const postsWithInfo = await Promise.all(
        posts.map(async (post) => {
            const commentsCount = await Comment.countDocuments({
                onPost: post._id
            });
            const likesCount = await Like.countDocuments({ onPost: post._id });
            if (user) {
                const isLiked = await Like.exists({
                    user: user._id,
                    onPost: post._id
                });
                return {
                    ...post,
                    commentsCount,
                    likesCount,
                    isLiked: !!isLiked
                };
            } else {
                return {
                    ...post,
                    commentsCount,
                    likesCount
                };
            }
        })
    );

    return res
        .status(200)
        .json(new ApiResponse(200, { postsWithInfo }, "Some posts fetched"));
});

const getPost = asyncHandler(async (req, res) => {
    const user = req.user;
    const { post_id } = req.params;
    if (!post_id) {
        throw new ApiError("post_id is required to get it");
    }

    const post = await Post.findById(post_id).populate("owner");
    if (!post) {
        throw new ApiError("post couldn't found. maybe wrong id");
    }

    const likesCount = await Like.countDocuments({ onPost: post_id });
    const commentsCount = await Comment.countDocuments({ onPost: post_id });
    if (user) {
        const isLiked = await Like.exists({ onPost: post_id, user: user._id });
        const isDisliked = await Dislike.exists({
            onPost: post_id,
            user: user._id
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    post,
                    likesCount,
                    commentsCount,
                    isLiked: !!isLiked,
                    isDisliked: !!isDisliked
                },
                "post fetched"
            )
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { post, likesCount, commentsCount },
                "post fetched"
            )
        );

    // only in 1 db call, but resource intensive
    // const postWithReactions = await Post.aggregate([
    //     { $match: { _id: new mongoose.Types.ObjectId(post_id) } },
    //     {
    //         $lookup: {
    //             from: "likes",
    //             let: { postId: "$_id" },
    //             pipeline: [
    //                 { $match: { $expr: { $eq: ["$onPost", "$$postId"] } } },
    //                 { $count: "count" }
    //             ],
    //             as: "likesCount"
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "dislikes",
    //             let: { postId: "$_id" },
    //             pipeline: [
    //                 { $match: { $expr: { $eq: ["$onPost", "$$postId"] } } },
    //                 { $count: "count" }
    //             ],
    //             as: "dislikesCount"
    //         }
    //     },
    //     ...(user
    //         ? [
    //               {
    //                   $lookup: {
    //                       from: "likes",
    //                       let: { postId: "$_id" },
    //                       pipeline: [
    //                           {
    //                               $match: {
    //                                   $expr: {
    //                                       $and: [
    //                                           { $eq: ["$onPost", "$$postId"] },
    //                                           {
    //                                               $eq: [
    //                                                   "$user",
    //                                                   new mongoose.Types.ObjectId(
    //                                                       user._id
    //                                                   )
    //                                               ]
    //                                           }
    //                                       ]
    //                                   }
    //                               }
    //                           },
    //                           { $limit: 1 }
    //                       ],
    //                       as: "liked"
    //                   }
    //               },
    //               {
    //                   $lookup: {
    //                       from: "dislikes",
    //                       let: { postId: "$_id" },
    //                       pipeline: [
    //                           {
    //                               $match: {
    //                                   $expr: {
    //                                       $and: [
    //                                           { $eq: ["$onPost", "$$postId"] },
    //                                           {
    //                                               $eq: [
    //                                                   "$user",
    //                                                   new mongoose.Types.ObjectId(
    //                                                       user._id
    //                                                   )
    //                                               ]
    //                                           }
    //                                       ]
    //                                   }
    //                               }
    //                           },
    //                           { $limit: 1 }
    //                       ],
    //                       as: "disliked"
    //                   }
    //               }
    //           ]
    //         : [])
    // ]);

    // if (!postWithReactions.length) {
    //     throw new ApiError("post couldn't found. maybe wrong id");
    // }

    // const result = postWithReactions[0];
});

const likePost = asyncHandler(async (req, res) => {
    const user = req.user;
    const { post_id } = req.body;
    if (!user) {
        throw new ApiError("Login is required to like post");
    }
    if (!post_id) {
        throw new ApiError("post_id is required to like the post");
    }
    const alreadyLiked = await Like.findOne({
        user: user._id,
        onPost: post_id
    });

    if (!alreadyLiked) {
        const likedPost = await Like.create({
            onPost: post_id,
            user: user._id
        });
        if (likedPost) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { likedPost },
                        "Post liked successfully"
                    )
                );
        } else {
            throw new ApiError("Error occured while liking post");
        }
    } else {
        const removedLike = await alreadyLiked.deleteOne();
        if (removedLike) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { removedLike },
                        "like removed successfully"
                    )
                );
        } else {
            throw new ApiError("Error occured while removing post like ");
        }
    }
});
const dislikePost = asyncHandler(async (req, res) => {
    const user = req.user;
    const { post_id } = req.body;
    if (!user) {
        throw new ApiError("Login is required to dislike post");
    }
    if (!post_id) {
        throw new ApiError("post_id is required to dislike the post");
    }
    const alreadyDisliked = await Dislike.findOne({
        onPost: post_id,
        user: user._id
    });

    if (!alreadyDisliked) {
        const dislikedPost = await Dislike.create({
            onPost: post_id,
            user: user._id
        });
        if (dislikedPost) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { dislikedPost },
                        "Post disliked successfully"
                    )
                );
        } else {
            throw new ApiError("Error occured while disliking post");
        }
    } else {
        const removedDislike = await alreadyDisliked.deleteOne();
        if (removedDislike) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { removedDislike },
                        "dislike removed successfully"
                    )
                );
        } else {
            throw new ApiError("Error occured while removing post dislike ");
        }
    }
});

const addPostComment = asyncHandler(async (req, res) => {
    const user = req.user;
    const { post_id, message } = req.body;
    if (!user) {
        throw new ApiError("Login is required to add comments");
    }
    if (!post_id || !message) {
        throw new ApiError("post_id and message are required. check req.body");
    }

    const comment = await Comment.create({
        publisher: user._id,
        onPost: post_id,
        message: message
    });
    if (!comment) {
        throw new ApiError("comment couldn't create");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, { comment }, "comment created successfully")
        );
});

const deletePostComment = asyncHandler(async (req, res) => {
    const user = req.user;
    const { comment_id } = req.body;
    if (!user) {
        throw new ApiError("login is required to delete your comments");
    }
    if (!comment_id) {
        throw new ApiError("Where is fucking comment_id eh?");
    }
    const authorizedComment = await Comment.findOne({
        _id: comment_id,
        publisher: user._id
    });
    if (authorizedComment) {
        const deletedComment = await authorizedComment.deleteOne();
        if (deletedComment) {
            return res
                .status(200)
                .json(new ApiError(200, {}, "Comment deleted successfully"));
        } else {
            throw new ApiError("error occured while deleting post comment");
        }
    }
});

export {
    createPost,
    getPost,
    likePost,
    dislikePost,
    addPostComment,
    deletePostComment,
    getChannelPosts
};
