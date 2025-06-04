// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/connect.js";

dotenv.config({ path: "./.env" });

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 4000, () => {
            console.log(
                `Server is listening on port ${process.env.PORT || 4000}`
            );
        });
    })
    .catch((error) => {
        console.error("Error in database connecting method:", error);
    });
