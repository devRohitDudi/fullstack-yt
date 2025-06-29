import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const currentUser = await User.findById(userId);
        const accessToken = await currentUser.generateAccessToken();
        const refreshToken = await currentUser.generateRefreshToken();
        currentUser.refreshToken = refreshToken;
        await currentUser.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Error generating tokens"
        });
    }
}; // utils

const registerUser = asyncHandler(async (req, res) => {
    // Algorithm
    // recieve data from request
    // validate data (valid, !emply)
    // check if user already exists (email, username)
    // upload image on Cloud
    // create user in DB with default playlist watchLater
    // remove password & refresh token from
    // return response
    const { fullName, email, password, username } = req.body;
    console.log("email: ", email);

    console.log("UserController files: ", req.files);

    if (
        [email, username, password, fullName].some(
            (field) => field.trim() === ""
        )
    ) {
        return res.status(408).json({
            success: false,
            message: "All fields are required."
        });
    }

    const userExistence = await User.findOne({
        $or: [{ username }, { email }]
    });

    console.log("userExistence: ", userExistence);

    if (userExistence) {
        return res.status(409).json({
            success: false,
            message: "A user is already exists with this email or username."
        });
    }
    // getting local path
    const coverImageResult = "";
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
        coverImageResult = await uploadOnCloudinary(coverImageLocalPath);
    }
    if (!avatarLocalPath) {
        return res.status(400).json({
            success: false,
            message: "Avatar file is required on server."
        });
    }

    // upload on cloudinary
    const avatarResult = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarResult) {
        return res.status(504).json({
            success: false,
            message: "Avatar file is required on Cloud."
        });
    }

    // create user in databse
    const user = await User.create({
        fullName,
        avatar: avatarResult.url,
        coverImage: coverImageResult.url || null,
        email: email,
        username: username.toLowerCase(),
        password,
        playlists: []
    });

    const watchLaterPlaylist = Playlist.create({
        name: "Watch later",
        owner: user._id
    });
    user.watchLater = await watchLaterPlaylist;
    user.playlists.push(await watchLaterPlaylist);
    await user.save();

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        return res.status(400).json({
            success: false,
            message: "Failed to register user (please check database code"
        });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        createdUser._id
    );

    const options = {
        httpOnly: true,
        secure: true
    };
    if (createdUser) {
        return res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    201,
                    { user: createdUser, accessToken, refreshToken },
                    "User registered success."
                )
            );
    }
}); //success

const loginUser = asyncHandler(async (req, res) => {
    // Algorithm to login
    // recieve credentials from frontend
    // username or email
    // find user
    // check password
    //  access & refresh token
    // return secure cookies

    console.log("Login controller invoked");

    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: "No form data provided. error from backend."
        });
    }
    const { username = null, email = null, password = null } = req.body;
    console.log("req.body: ", req.body);

    if (!email && !username) {
        return res.status(400).json({
            success: false,
            message: "username or email is required to login."
        });
    }

    const userInstance = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!userInstance) {
        return res.status(400).json({
            success: false,
            message: "User does not exist"
        });
    }

    // using the injected method of bcrypt in userSchema
    const isPasswordValid = await userInstance.isPasswordCorrect(password);

    if (!isPasswordValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid password"
        });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        userInstance._id
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    const loggedInUser = await User.findById(userInstance._id).select(
        "-password -refreshToken"
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            })
        );
}); //success

const logoutUser = asyncHandler(async (req, res) => {
    // through auth middleware user is already injected in req
    // find the user by id
    // remove the refreshToken
    const userToLogout = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out successfully"));
}); //success

const refreshTheAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        return res.status(300).json({
            success: false,
            message: "Login is required."
        });
    }
    const decodedRefreshToken = await jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    // instead of decryption & finding user, can use verifyJWT middleware
    const requesterUser = await User.findById(decodedRefreshToken._id);

    if (!requesterUser) {
        return res.status(400).json({
            success: false,
            message: "invalid refresh token"
        });
    }
    console.log("requesterUser.refreshToken: ", requesterUser.refreshToken);
    console.log("decodedRefreshToken: ", decodedRefreshToken);

    if (requesterUser.refreshToken == incomingRefreshToken) {
        try {
            const { accessToken, refreshToken } =
                generateAccessAndRefreshTokens(requesterUser._id);
            const options = {
                httpOnly: true,
                secure: true
            };

            const loggedInUser = await User.findById(requesterUser._id).select(
                "-password -refreshToken"
            );

            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        {
                            user: loggedInUser,
                            accessToken,
                            refreshToken
                        },
                        "Access token refreshed successfully"
                    )
                );
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Error generating tokens"
            });
        }
    } else {
        return res.status(200).json({
            success: false,
            message: "refresh token is expired or used."
        });
    }
}); //success

const changeUserPassword = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(300).json({
            success: false,
            message: "Login is required."
        });
    }
    const { oldPassword, newPassword } = req.body;

    const userInDB = await User.findById(req.user._id);

    const isCorrect = await userInDB.isPasswordCorrect(oldPassword);

    if (!isCorrect) {
        return res.status(300).json({
            success: false,
            message: "incorrect old password"
        });
    }

    // for encryption of password there's a method in Schema .pre on save()
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .cookie("accessToken", "")
        .cookie("refreshToken", "")
        .json(
            new ApiResponse(200, {}, "Password updated! now login and continue")
        );
}); //success

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    console.log("get-current-user invoked");

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Please login to continue"
        });
    }
    return res.status(200).json({
        statusCode: 200,
        data: null,
        message: {
            user: {
                username: user.username,
                avatar: user.avatar,
                fullName: user.fullName,
                email: user.email
            }
        },
        success: true
    });
}); //success

const updateDetails = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(300).json({
            success: false,
            message: "Login is required to update details"
        });
    }
    const details = req.body || {};

    const currentUser = await User.findByIdAndUpdate(req.user._id);

    const updatedUser = await currentUser.updateOne({
        username:
            details.username.length <= 0
                ? currentUser.username
                : details.username,
        fullName:
            details.fullName.length <= 0
                ? currentUser.fullName
                : details.fullName,
        bio: details.bio.length <= 0 ? currentUser.bio : details.bio,
        email: details.email.length <= 0 ? currentUser.email : details.email
    });

    currentUser.save({ validateBeforeSave: false });

    return res
        .status(200, "reached to updateDetails()")
        .json(
            new ApiResponse(
                200,
                { updatedUser },
                "Account details updated successfully"
            )
        );
}); // success

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        return res.status(300).json({
            success: false,
            message: "avatar file is required"
        });
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        return res.status(300).json({
            success: false,
            message: "error while uploading avatar"
        });
    }

    const user = await User.findById(req.user._id);
    const oldURL = user.avatar;

    user.avatar = avatar.url;

    await user.save({ validateBeforeSave: false });

    await deleteOnCloudinary(oldURL);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { avatar: avatar.url },
                "avatar updated successfully"
            )
        );
}); //success

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        return res.status(300).json({
            success: false,
            message: "cover image is required to update it"
        });
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        return res.status(300).json({
            success: false,
            message: "error while uploading coverImage"
        });
    }

    const user = await User.findById(req.user._id);
    const oldURL = user.coverImage;

    user.coverImage = coverImage.url;

    await user.save({ validateBeforeSave: false });

    if (oldURL) {
        await deleteOnCloudinary(oldURL);
    }

    res.status(200).json(
        new ApiResponse(
            200,
            { coverImage: coverImage.url },
            "coverImage updated successfully"
        )
    );
}); // success

const getWatchHistory = asyncHandler(async (req, res) => {
    if (!req.user._id) {
        return res.status(300).json({
            success: false,
            message: "login is required to get watchHistory"
        });
    }

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $arrayElemAt: ["$owner", 0] } // Get the first element of the owner array
                        }
                    }
                ]
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "User watchHistory fetched."
            )
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshTheAccessToken,
    changeUserPassword,
    getCurrentUser,
    updateDetails,
    updateAvatar,
    updateCoverImage,
    getWatchHistory
};
