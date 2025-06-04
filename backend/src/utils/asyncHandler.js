import express from "express";

// const asyncHandler = (requestHandler) =>
//     (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((error) =>
//             next(error)
//         );
//
// };

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        console.log("status code is:", error.code);

        res.status(500).json({
            success: false,
            message: ("from asynchandler:", error.message)
        });
        console.error("Error in asyncHandler:", error);
    }
};

export { asyncHandler };
