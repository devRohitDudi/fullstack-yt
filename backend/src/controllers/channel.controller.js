import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Dislike } from "../models/dislike.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { Playlist } from "../models/playlist.model.js";
import { Post } from "../models/post.model.js";

//verified
const getChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username) {
        return res.status(300).json({
            success: false,
            message: "username is required"
        });
    }

    const channel = await User.findOne({ username: username });

    if (!channel) {
        return res.status(300).json({
            success: false,
            message: "channel does not found"
        });
    }

    // a trick for only retrieve isSubscribed if req.user._id is available
    const pipeline = [
        { $match: { username: username?.toLowerCase() } },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribing"
            }
        }
    ];

    // Only push this stage if user is logged in
    if (req.user?._id) {
        pipeline.push({
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                subscribingCount: { $size: "$subscribing" },
                isSubscribed: {
                    $in: [
                        req.user._id,
                        {
                            $map: {
                                input: "$subscribers",
                                as: "sub",
                                in: "$$sub.subscriber"
                            }
                        }
                    ]
                }
            }
        });
    } else {
        pipeline.push({
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                subscribingCount: { $size: "$subscribing" }
            }
        });
    }

    pipeline.push({
        $project: {
            fullName: 1,
            username: 1,
            bio: 1,
            subscribersCount: 1,
            subscribingCount: 1,
            isSubscribed: { $ifNull: ["$isSubscribed", false] },
            email: 1,
            avatar: 1,
            coverImage: 1
        }
    });

    const channelInfo = await User.aggregate(pipeline);

    if (!channelInfo?.length) {
        return res.status(300).json({
            success: false,
            message: "channel does not found"
        });
    }

    console.log("Querying videos count for channel:", channel._id);

    const videosCount = await Video.countDocuments({
        owner: channel._id,
        visibility: "public"
    });
    const postsCount = await Post.countDocuments({
        owner: channel._id
    });
    const playlistsCount = await Playlist.countDocuments({
        owner: channel._id,
        visibility: "public"
    });
    // channel.videosCount = videosCount;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { channelInfo, videosCount, playlistsCount, postsCount },
                "channel fetched successfully"
            )
        );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (!username) {
        return res.status(300).json({
            success: false,
            message: "username is required"
        });
    }
    const channel = await User.findOne({ username: username });
    const channelVideos = await Video.find({
        owner: channel._id,
        visibility: "public"
    })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    if (!channelVideos) {
        return res.status(300).json({
            success: false,
            message: "error while retrieving channel videos"
        });
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { channelVideos },
                "channel videos retrieved successfully"
            )
        );
});

const getChannelPlaylists = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (!username) {
        return res.status(300).json({
            success: false,
            message: "username is required to get Playlists"
        });
    }
    const user = req.user;

    const channel = await User.findOne({ username: username });
    if (!channel) {
        return res.status(300).json({
            success: false,
            message: "requested channel does not exist"
        });
    }

    const channelPlaylists = await Playlist.find({
        owner: channel._id,
        visibility: "public"
    })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { channelPlaylists },
                "channel playlists fetched successfully"
            )
        );
});

const getChannelAvatar = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username) {
        return res.status(300).json({
            success: false,
            message: "username is required to get avatar of"
        });
    }
    const userAvatar = await User.find({ username: username }).select("avatar");

    console.log("user avatar is:", userAvatar);

    return res
        .status(200)
        .json(new ApiResponse(200, { userAvatar }, "User avatar fetched"));
});
export {
    getChannelVideos,
    getChannelPlaylists,
    getChannelProfile,
    getChannelAvatar
};
