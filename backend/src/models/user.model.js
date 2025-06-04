import mongoose, { Schema } from "mongoose";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
            min: 3,
            max: 40
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
            min: 3,
            max: 40
        },
        fullName: {
            type: String,
            required: true,
            index: true,
            min: 3,
            max: 40
        },

        password: {
            type: String,
            required: [true, "Password is required."],
            min: 6,
            max: 128
        },
        refreshToken: {
            type: String,
            default: null
        },
        avatar: {
            type: String, //Cloudinary URL
            default: "https://i.imgur.com/6VBx3io.png"
        },
        coverImage: {
            type: String //cloudinary URL
        },
        bio: {
            type: String,
            index: true,
            default: "Hello, I am using this app"
        },
        watchHistory: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Video", default: [] }
        ],
        playlists: [
            {
                type: Schema.Types.ObjectId,
                ref: "Playlist"
            }
        ],
        isVerified: {
            type: Boolean,
            default: false
        },
        isLive: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        isAdmin: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// injecting a custom method in userSchema for checking the password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // this.password is already encrypted in userSchema
};

// injecting a custom method in userSchema for generating JWT
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            name: this.name
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);
