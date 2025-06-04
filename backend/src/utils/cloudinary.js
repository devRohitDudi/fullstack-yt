import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Return "https" URLs by setting secure: true
cloudinary.config({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Log the configuration
console.log(cloudinary.config());

// upload the media
const uploadOnCloudinary = async (filePath) => {
    // Use the uploaded file's name as the asset's public ID and
    // allow overwriting the asset with new versions
    const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: "auto"
    };
    try {
        if (!filePath) return "Couldn't find the filePath parameter.";
        // Upload the file
        const result = await cloudinary.uploader.upload(filePath, options);
        console.log("File has been uploaded successfully: ", result.url);
        fs.unlinkSync(filePath);
        return result;
    } catch (error) {
        fs.unlinkSync(filePath);
        console.error(
            "File upload error in cloudinary! file is unlinked to server: ",
            error
        );
    }
};

const deleteOnCloudinary = async (filePath) => {
    function extractPublicId(url) {
        const parts = url.split("/upload/")[1]; // get after /upload
        const withoutVersion = parts.replace(/^v\d+\//, ""); // remove version
        const publicId = withoutVersion.replace(/\.[^/.]+$/, ""); // remove extension
        return publicId;
    }

    const url = filePath;
    console.log(extractPublicId(url));

    cloudinary.uploader.destroy(extractPublicId(url), function (error, result) {
        console.log(result, error);
    });
};

export { uploadOnCloudinary, deleteOnCloudinary };
