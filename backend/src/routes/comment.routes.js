import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    likeComment,
    getVideoComments,
    deleteComment,
    dislikeComment,
    replyOn,
    getReplies,
    getPostComments
} from "../controllers/comment.controller.js";

const router = Router();


// verified
router.route("/delete-comment/:comment_obj_id").patch(verifyJWT, deleteComment);

// TODO POST page and comments pagination
router.route("/get-post-comments/:post_id").get(verifyJWT, getPostComments);

//
router.route("/get-replies/:comment_obj_id").get(verifyJWT, getReplies);

// verified
router.route("/like-comment/:comment_obj_id").patch(verifyJWT, likeComment);
router.route("/reply-on/:comment_obj_id").patch(verifyJWT, replyOn);

//verified
router
    .route("/dislike-comment/:comment_obj_id")
    .patch(verifyJWT, dislikeComment);

export default router;
