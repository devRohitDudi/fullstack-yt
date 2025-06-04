import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Video } from "../models/video.model.js";

//verified
const subscribeChannel = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(403).json(
            403,
            {
                message: "Authentication is required to subscribe a channel"
            },
            "Authentication is required to subscribe a channel"
        );
    }
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(300, "channel id is required to subscribe.");
    }

    //check if channel is exists or not
    const channelExistence = await User.findOne({
        username: channelId
    });

    if (user._id.toString() == channelExistence._id.toString()) {
        throw new ApiError("You can't subscribe yourself");
    }

    if (!channelExistence) {
        throw new ApiError(400, "requested channel doesn't exist");
    }

    console.log("channelExistence: ", channelExistence);

    // check if already subscribed
    const subscriptionExistence = await Subscription.findOne({
        subscriber: user._id,
        channel: channelExistence._id
    });

    if (subscriptionExistence) {
        // if Subscription exists than unsubscribe
        await Subscription.deleteOne({
            subscriber: user._id,
            channel: channelExistence._id
        });
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { subscriptionExistence },
                    "Unsubscribed successfully"
                )
            );
    } else {
        // else subscribe
        const subscription = new Subscription({
            subscriber: user._id,
            channel: channelExistence._id
        });
        await subscription.save({ new: true });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { subscription },
                    "Subscribed successfully"
                )
            );
    }
});

export { subscribeChannel };
