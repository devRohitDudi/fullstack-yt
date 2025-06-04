import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { deleteComment } from "./comment.controller.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ObjectId } from "mongodb";

import mongoose from "mongoose";

//fix this
const getPlaylist = asyncHandler(async (req, res) => {
    const user = req.user;
    const { playlist_id } = req.params;
    if (!playlist_id) {
        throw new ApiError("playlist_id is required");
    }
    if (!playlist_id || typeof playlist_id !== "string") {
        throw new ApiError("playlist_id must be a valid string");
    }

    if (!mongoose.Types.ObjectId.isValid(playlist_id)) {
        throw new ApiError("Invalid playlist_id format");
    }

    const playlist = await Playlist.findById(playlist_id).populate({
        path: "videos",
        match: { visibility: { $ne: "private" } } // exclude videos with visibility "private"
    });

    const isOwner = (await playlist.owner.toString()) === user._id.toString();

    if (!playlist) {
        throw new ApiError("Playlist couldn't retrieve");
    }
    if (playlist.visibility == "private") {
        if (user._id.toString() === playlist.owner.toString()) {
            return res.status(200).json(
                new ApiResponse(
                    200,
                    {
                        playlist,
                        isOwner
                    },
                    "playlist fetched successfully"
                )
            );
        } else {
            throw new ApiError("requested playlist is private");
        }
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, { playlist }, "playlist fetched successfully")
        );
});

const getAllPlaylists = asyncHandler(async (req, res) => {
    const user = req.user;
    const { currentVideo } = req.body || {};
    console.log("currentVideo", currentVideo);

    if (!user) {
        throw new ApiError("Login is required to get all playlists");
    }

    const userInDb = await User.findOne({ username: user.username });

    if (!userInDb) {
        throw new ApiError(
            "You, as a requester user are not avalable in database. fuck off"
        );
    }

    const playlists = await Playlist.find({ owner: userInDb._id });

    if (currentVideo) {
        const result = playlists.map((playlist) => ({
            _id: playlist._id,
            name: playlist.name,
            visibility: playlist.visibility,
            containsVideo: playlist.videos.some(
                (video) => video._id.toString() === currentVideo.toString()
            )
        }));
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { playlists: result },
                    "all pllaylists fetched"
                )
            );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { playlists }, "all pllaylists fetched"));
});
const updateVideoStatus = asyncHandler(async (req, res) => {
    const user = req.user;
    const { video_id, containsVideo, playlist_id } = req.body;
    if (!user) {
        throw new ApiError("login is required to update playlists");
    }
    if (!video_id) {
        throw new ApiError("video_id is required to update playlist");
    }
    const playlist = await Playlist.findById(playlist_id);
    if (containsVideo) {
        playlist.videos.push(video_id);
    } else {
        playlist.videos = playlist.videos.filter(
            (id) => id.toString() !== video_id.toString()
        );
    }

    await playlist.save();

    return res
        .status(200)
        .json(new ApiError(200, { playlist }, "Playlist updated successfully"));
});

const createPlaylist = asyncHandler(async (req, res) => {
    const user = req.user;
    const { name, description = "", visibility = "private" } = req.body;
    if (!user) {
        throw new ApiError("login is required to create playlist");
    }
    if (!name) {
        throw new ApiError(
            "In order to create a new playlist fucking name is required my friend"
        );
    }

    const createdPlaylist = await Playlist.create({
        name: name,
        description: description,
        owner: user._id,
        visibility: visibility
    });

    if (!createdPlaylist) {
        throw new ApiError("playlist couldn't created");
    }

    await user.playlists.push(createdPlaylist);
    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { createdPlaylist },
                "Playlist Created successfully"
            )
        );
});
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlist_id } = req.params;
    const user = req.user;
    if (!playlist_id) {
        throw new ApiError("Playlist_id is required to delete it");
    }
    if (!user) {
        throw new ApiError("want to delete playlist eh? login first!");
    }
    const playlist = await Playlist.findById(playlist_id);

    if (!playlist) {
        throw new ApiError("Playlist not found! maybe already deleted");
    }
    if (playlist.owner.toString() !== user._id.toString()) {
        throw new ApiError(
            "Unauthorized request! you don't have permission to delete this playlist"
        );
    }

    const deletedPlaylist = await Playlist.deleteOne({ _id: playlist_id });
    if (deletedPlaylist.deletedCount === 1) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, { deletedPlaylist }, "playlist deleted!")
            );
    } else {
        return res
            .status(200)
            .json(new ApiResponse(503, {}, "Error while deleting playlist"));
    }
});

const addToPlaylist = asyncHandler(async (req, res) => {
    const { video_id, playlist_id } = req.body;
    const user = req.user;

    if (!playlist_id) {
        throw new ApiError("Playlist_id is requied to add videos into");
    }
    if (!video_id) {
        throw new ApiError("video_id is required to add into playlist");
    }
    if (!user) {
        throw new ApiError("Login is required to add videos into playlists");
    }
    const video = await Video.findById(video_id);
    if (!video) {
        throw new ApiError("video not found on databse! maybe wrong id.");
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlist_id, owner: user._id },
        { $addToSet: { videos: video_id } },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError("Plalist not found or Unauthorized access");
    }

    // now no need for this, only 1 db call is efficient
    // const playlist = await Playlist.findById(playlist_id);
    // if (!playlist) {
    // throw new ApiError("Playlist not found");
    // }
    // if (user._id.toString() !== (await playlist.owner.toString())) {
    //     throw new ApiError(
    //         "Unauthorized access! you cannot update this playlist"
    //     );
    // }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { updatedPlaylist },
                "playlist updated successfully"
            )
        );
});

const removeFromPlaylist = asyncHandler(async (req, res) => {
    const user = req.user;
    const { video_id, playlist_id } = req.body;
    if (!user) {
        throw new ApiError("Login is required to remove from Playlist");
    }
    if (!playlist_id) {
        throw new ApiError("playlist_id is required to remove from");
    }
    if (!video_id) {
        throw new ApiError("video_id is required to remove ");
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlist_id, owner: user._id },
        { $pull: { videos: video_id } },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError("Error occured while deleting video from playlist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { updatedPlaylist },
                "requested video removed from playlist"
            )
        );
});

export {
    getPlaylist,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    getAllPlaylists,
    updateVideoStatus
};
