import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// console.log(process.env.CLOUDINARY_API_KEY);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // Delete temporary file after successful upload
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        
        fs.unlinkSync(localFilePath)
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
  try {

    if(!publicId) return null;

    const result = await cloudinary.uploader.destroy(publicId);

    return result;

  } catch (error) {

    console.log("Cloudinary delete error:", error)

    return null;
    
  }
};

export { uploadOnCloudinary };