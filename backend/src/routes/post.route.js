import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    createPost,
    dislikePost,
    getPost,
    likePost,
    addPostComment,
    getChannelPosts
} from "../controllers/post.controller.js";
import multer from "multer";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

//verified
router
    .route("/create-post")
    .post(verifyJWT, upload.array("photos", 10), createPost);

//verified
router.route("/like-post").patch(verifyJWT, likePost);

//verified
router.route("/add-comment").post(verifyJWT, addPostComment);

//verified
router.route("/get-channel-posts/:username").get(verifyJWT, getChannelPosts);

//verified
router.route("/dislike-post").get(verifyJWT, dislikePost);

//verified
router.route("/get/:post_id").get(verifyJWT, getPost);

export default router;
