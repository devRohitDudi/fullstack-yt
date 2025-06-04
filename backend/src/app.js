import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { upload } from "./middlewares/multer.middleware.js";
const port = process.env.PORT || 4000;
const app = express();

app.use(
    cors({
        origin: [
            process.env.CORS_ORIGIN || "http://localhost:4000",
            "http://localhost:5173"
        ],
        credentials: true
        // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        // allowedHeaders: ["Content-Type", "Authorization", "Accept"]
    })
);

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// Routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import channelRouter from "./routes/channel.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.routes.js";
// router declaration
app.use("/api/v1/user", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/channel", channelRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/comment", commentRouter);
// app.use("/api/v1", (req, res) => {
//     return res.status(300).send("<h1>Server is listening</h1>");
// });
export default app;
