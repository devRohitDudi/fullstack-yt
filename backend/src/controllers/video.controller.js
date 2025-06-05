import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Dislike } from "../models/dislike.model.js";
import { Subscription } from "../models/subscription.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { History } from "../models/history.model.js";
import path from "path";
import { subscribe } from "diagnostics_channel";

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description, tags = null, visibility } = req.body;

    if (!title) {
        return res.status(300).json({
            success: false,
            message: "Title is required"
        });
    }

    const user = await req.user;
    if (!user) {
        return res.status(300).json({
            success: false,
            message: "Login is required to upload videos"
        });
    }

    const videoFile = req.files?.video?.[0];
    const videoFileLocalPath = videoFile.path;
    const allowedVideoExtensions = [
        ".mp4",
        ".m4v",
        ".mkv",
        ".mov",
        ".webm",
        ".avi"
    ];

    if (!videoFileLocalPath) {
        return res.status(300).json({
            success: false,
            message: "Video file is required"
        });
    }

    // Validate extension
    const videoExt = path.extname(videoFile.originalname).toLowerCase();
    if (!allowedVideoExtensions.includes(videoExt)) {
        throw new ApiError(
            415,
            `Invalid video format. Allowed: ${allowedVideoExtensions.join(", ")}`
        );
    }

    const thumbnail1LocalPath = req.files?.thumbnail1[0]?.path;
    const thumbnail2LocalPath = req.files?.thumbnail2?.[0]?.path;
    const thumbnail3LocalPath = req.files?.thumbnail3?.[0]?.path;

    if (!thumbnail1LocalPath) {
        throw new ApiError(
            300,
            `At least 1 thumbnail is required, on frontend please provide item at "thumbnail1"`
        );
    }

    const video = await uploadOnCloudinary(videoFileLocalPath);

    const thumbnail1 = await uploadOnCloudinary(thumbnail1LocalPath);

    const thumbnail2 = thumbnail2LocalPath
        ? await uploadOnCloudinary(thumbnail2LocalPath)
        : null;
    const thumbnail3 = thumbnail3LocalPath
        ? await uploadOnCloudinary(thumbnail3LocalPath)
        : null;

    console.log("thumbnail1 cloudinary: ", thumbnail1);
    console.log("video cloudinary: ", video);

    const videoInSchema = await Video.create({
        videoURL: video.url,
        videoAssetId: video.asset_id,
        title: title,
        description: description,
        tags: tags,
        thumbnail1: thumbnail1.url,
        thumbnail2: thumbnail2?.url ? thumbnail2.url : null,
        thumbnail3: thumbnail3?.url ? thumbnail3.url : null,
        duration: video.duration,
        visibility: visibility,
        owner: await user._id
    });
    if (!videoInSchema) {
        return res.status(300).json({
            success: false,
            message: "error while video document creation"
        });
    }
    // yeah it is created successfully
    console.log("videoInSchema:", videoInSchema);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { videoInSchema },
                "video file has been uploaded succesfully"
            )
        );
});

const homeVideos = asyncHandler(async (req, res) => {
    let interests = [];
    const user = req.user;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (user) {
        const user = await User.findById(req.user._id).select("interestedIn");
        if (user && user.interestedIn) {
            interests = user.interestedIn;
        }
    } else if (req.body && req.body.localInterests) {
        interests = req.body.localInterests;
    }
    let videos = null;
    if (interests.length > 0) {
        const interestPatterns = interests.map((term) => new RegExp(term, "i")); // created patterns for matching sentences

        videos = await Video.find({
            visibility: "public",
            $or: [
                {
                    tags: { $in: { interests } }
                },
                ...interestPatterns.map((term) => ({ title: term })),
                ...interestPatterns.map(
                    (term) => (console.log(term), { description: term })
                )
            ]
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("owner", "avatar fullName username");

        const videosWithWatchInfo = await Promise.all(
            videos.map(async (video) => {
                const isWatched = await History.exists({
                    user: user._id,
                    video: video._id
                });
                return { ...video, isWatched };
            })
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { videos: videosWithWatchInfo },
                    "some videos recommanded to user"
                )
            );
    } else {
        videos = await Video.find({ visibility: "public" })
            // .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("owner", "avatar fullName username");

        return res
            .status(200)
            .json(new ApiResponse(200, { videos }, "videos randomly found"));
    }
});

const getVideo = asyncHandler(async (req, res) => {
    const { video_obj_id } = req.params;
    const video = await Video.findById(video_obj_id).select(
        "-dislikes -likes -tags -comments"
    );
    if (!video) {
        return res.status(300).json({
            success: false,
            message: "video couldn't found"
        });
    }
    const channel = await User.findById({ _id: video.owner }).select(
        "username fullName avatar"
    );

    const subscribersCount = await Subscription.countDocuments({
        channel: channel._id
    });
    // how many Documents are in the Like schema in which this video url is available as onVideo
    const likesCount = await Like.countDocuments({ onVideo: video_obj_id });
    const commentsCount = await Comment.countDocuments({
        onVideo: video_obj_id
    });
    if (req.user) {
        const isLiked = await Like.exists({
            onVideo: video_obj_id,
            user: req.user._id
        });
        const isDisliked = await Dislike.exists({
            onVideo: video_obj_id,
            user: req.user._id
        });
        const isSubscribed = await Subscription.exists({
            subscriber: req.user._id,
            channel: channel._id
        });
        if (video.visibility == "public") {
            // for unlisted videos show on frontend
            return res.status(200).json(
                new ApiResponse(
                    200,
                    // Host your own redirect endpoint
                    // load the video
                    {
                        video,
                        commentsCount,
                        likesCount,

                        subscribersCount,
                        channel,
                        isLiked: !!isLiked,
                        isDisliked: !!isDisliked,
                        isSubscribed: !!isSubscribed
                    },
                    "requested video fetched successfully, load video on player using provided videoURL"
                )
            );
        } else if (video.visibility == "private") {
            return res.status(300).json({
                success: false,
                message: "Requested video is private"
            });
        }
    }

    if (video.visibility == "public") {
        // for unlisted videos show on frontend
        return res.status(200).json(
            new ApiResponse(
                200,
                // Host your own redirect endpoint
                // load the video
                {
                    video,
                    commentsCount,
                    likesCount,

                    subscribersCount,
                    channel
                },
                "requested video fetched successfully, load video on player using provided videoURL"
            )
        );
    } else if (video.visibility == "private") {
        return res.status(300).json({
            success: false,
            message: "Requested video is private"
        });
    }
});

const addLike = asyncHandler(async (req, res) => {
    const { video_obj_id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(300).json({
            success: false,
            message: "login is required to like the video"
        });
    }

    const alreadyLiked = await Like.findOne({
        onVideo: video_obj_id,
        user: user._id
    });

    if (!alreadyLiked) {
        await Like.create({ onVideo: video_obj_id, user: user._id });
        return res.status(200).json(new ApiResponse(200, {}, "like added"));
    } else {
        await alreadyLiked.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "like removed"));
    }

    // costly operation so can be handled on frontend eh?
    // const totalLikesOnVideo = await Like.countDocuments({ onVideo: video_obj_id });
});
const addDislike = asyncHandler(async (req, res) => {
    const { video_obj_id } = req.params;
    const user = req.user;

    if (!user) {
        throw new ApiError(
            300,
            "in order to dislike this fucking video, login is required my friend."
        );
    }

    const alreadyDisliked = await Dislike.findOne({
        onVideo: video_obj_id,
        user: user._id
    });

    if (!alreadyDisliked) {
        await Dislike.create({ onVideo: video_obj_id, user: user._id });
        return res.status(200).json(new ApiResponse(200, {}, "dislike added"));
    } else {
        await alreadyDisliked.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "dislike removed"));
    }

    // no need to show dislikes
    // const totalDislikesOnVideo = await Dislike.countDocuments({ onVideo: url });
});

const addViewAndHistory = asyncHandler(async (req, res) => {
    const { video_obj_id } = req.params;
    const user = req.user;
    if (!video_obj_id) {
        return res.status(300).json({
            success: false,
            message: "video_obj_id is required to add view into"
        });
    }
    const video = await Video.findById(video_obj_id);
    if (!video) {
        return res.status(300).json({
            success: false,
            message: "Requested video not found"
        });
    }
    video.views += 1;

    await video.save({ validateBeforeSave: false });

    if (!user) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { message: "video view added" },
                    "Video view added"
                )
            );
    } else {
        const alreadInhistory = await History.findOne({
            user: user._id,
            video: video._id
        });

        if (alreadInhistory) {
            return res.status(200).json(
                new ApiResponse(
                    200,
                    {
                        message: "view added and video already is in history"
                    },
                    "view added and video already is in history"
                )
            );
        }
        const createdHistory = await History.create({
            user: user._id,
            video: video._id
        });
        if (createdHistory) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { message: "view added & video added to watchHistory" },
                        "view added & video added to watchHistory"
                    )
                );
        } else {
            return res.status(300).json({
                success: false,
                message: "Error occured while adding to watch history"
            });
        }
    }
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(300).json({
            success: false,
            message: "Login is required to get watchHistory"
        });
    }
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log("page is:", page);

    const totalDocs = await History.countDocuments({ user: user._id });

    const history = await History.find({ user: user._id })
        .populate("video")
        // .select("thumbnail1 title createdAt") // Optional: populate video details
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1, _id: -1 });
    return res
        .status(200)
        .json(
            new ApiResponse(200, { history }, "some channel history fetched")
        );
});

const removeFromWatchHistory = asyncHandler(async (req, res) => {
    const user = req.user;
    const { history_obj_id } = req.params;

    const deletedHistory = await History.deleteOne({ _id: history_obj_id });

    if (deletedHistory) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Video removed from watchHistory"));
    } else {
        return res
            .status(200)
            .josn(
                new ApiResponse(
                    200,
                    {},
                    "Error occured while removing from watchHistory"
                )
            );
    }
});

export {
    getVideo,
    addLike,
    addDislike,
    uploadVideo,
    addViewAndHistory,
    removeFromWatchHistory,
    getWatchHistory,
    homeVideos
};
