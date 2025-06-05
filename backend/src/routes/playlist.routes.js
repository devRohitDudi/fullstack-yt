import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

import {
    getPlaylist,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    getAllPlaylists,
    updateVideoStatus,
    addToWatchLater
} from "../controllers/playlist.controller.js";

//verified
router.route("/get-playlist/:playlist_id").get(verifyJWT, getPlaylist);
//verified
router.route("/add-to-watch-later/:video_id").patch(verifyJWT, addToWatchLater);
//verified
router.route("/get-all-playlists").post(verifyJWT, getAllPlaylists);
//verified
router.route("/update-video-status").patch(verifyJWT, updateVideoStatus);
// vrified
router.route("/create-playlist").patch(verifyJWT, createPlaylist);
//verified
router.route("/delete-playlist/:playlist_id").patch(verifyJWT, deletePlaylist);

// router.route("/add-to-playlist/").patch(verifyJWT, addToPlaylist);

router.route("/remove-from-playlist/").patch(verifyJWT, removeFromPlaylist);

export default router;
