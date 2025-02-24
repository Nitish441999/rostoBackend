import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { fileURLToPath } from "url";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // The Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY, // The Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // The Cloudinary API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const responce = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });
    fs.unlinkSync(localFilePath);
    return responce;
  } catch (error) {
    fs.unlinkSync(fileURLToPath);
    return null;
  }
};
export { uploadOnCloudinary };
