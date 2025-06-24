import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getVideo,
    addLike,
    addDislike,
    addViewAndHistory,
    uploadVideo,
    removeFromWatchHistory,
    getWatchHistory,
    homeVideos
} from "../controllers/video.controller.js";

import {
    likeComment,
    addComment,
    getVideoComments,
    deleteComment,
    dislikeComment,
    replyOn,
    getReplies
} from "../controllers/comment.controller.js";

const router = Router();

//verified
router.route("/upload").post(
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail1", maxCount: 1 },
        { name: "thumbnail2", maxCount: 1 },
        { name: "thumbnail3", maxCount: 1 }
    ]),
    verifyJWT,
    uploadVideo
);

//verified
router.route("/get-video/:video_obj_id").get(verifyJWT, getVideo);

router.route("/home").post(verifyJWT, homeVideos);

//verified
router
    .route("/add-view-history/:video_obj_id")
    .patch(verifyJWT, addViewAndHistory);

router.route("/get-watch-history").get(verifyJWT, getWatchHistory);

//verified
router
    .route("/remove-watch-history/:history_obj_id")
    .patch(verifyJWT, removeFromWatchHistory);

//verified
//TODO: get comment with isLiked or isDisliked peoperties
router.route("/comments/:video_obj_id").get(verifyJWT, getVideoComments);

//verified
router.route("/add-like/:video_obj_id").patch(verifyJWT, addLike);

//verified
router.route("/add-dislike/:video_obj_id").patch(verifyJWT, addDislike);

export default router;
