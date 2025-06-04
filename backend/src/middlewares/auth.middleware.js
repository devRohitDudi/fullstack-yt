import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            console.log("did not found token in auth middleware");
            next();
        } else {
            console.log("token found in middleware");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const authUser = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );
        if (!authUser) {
            next();
        }
        req.user = authUser;
        next();
    } catch (error) {
        console.log("couldn't verify user");
    }
});
export { verifyJWT };
