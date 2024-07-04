import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
    try {
        
        if (!filePath) return null;
        let response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
            
        });

        console.log("File uploaded successfully on cloudinary ", response);
        fs.unlinkSync(filePath);
        return response;
    } catch (error) {
        fs.unlinkSync(filePath);
        return null;
    }
};

const deleteOnCloudinary = async (fileLink,type = "image") => {
    try {
        const parts = fileLink.split("/");
        const imageNameWithExtension = parts[parts.length - 1];
        const imageNameWithoutExtension = imageNameWithExtension.split(".")[0];
        const deleteFile = await cloudinary.api.delete_resources(
           [ imageNameWithoutExtension],{resource_type:type}
        );
        console.log("id to delete",imageNameWithoutExtension);
        if (!deleteFile) {
            throw new ApiError(
                500,
                "Something wentt wrong while deleting the previous image"
            );
        }
        console.log("deleted file", deleteFile);
    } catch (error) {
        throw new ApiError(
            500,
            "Something wentt wrong while deleting the previous image :: error"
        );
    }
};

export { uploadOnCloudinary, deleteOnCloudinary };