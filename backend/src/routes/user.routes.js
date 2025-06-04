import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshTheAccessToken,
    changeUserPassword,
    updateDetails,
    getCurrentUser,
    updateAvatar,
    updateCoverImage,
    getWatchHistory
} from "../controllers/user.controller.js";
import { subscribeChannel } from "../controllers/subscription.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);

router.route("/login").post(upload.any(), loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-tokens").post(refreshTheAccessToken);
router.route("/change-password").post(verifyJWT, changeUserPassword);
router.route("/get-current-user").get(verifyJWT, getCurrentUser);

router.route("/update-details").patch(verifyJWT, updateDetails);

router
    .route("/update-avatar")
    .patch(verifyJWT, upload.single("avatar"), updateAvatar);

router
    .route("/update-cover-image")
    .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
