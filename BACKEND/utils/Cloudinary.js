/**
 * File: Cloudinary.js
 * Description: Implementation of Cloudinary.js
 */
import cloudinary from '../config/Cloudinary.js';
export // Performs the delete image from cloudinary operation
const DeleteImageFromCloudinary = async (publicId) => {
    if (!publicId) return;

    return await cloudinary.uploader.destroy(publicId);
};


export // Performs the upload image to cloudinary operation
const UploadImageToCloudinary = async (filePath, folder = 'win-o-learn') => {
    return await cloudinary.uploader.upload(filePath, {
        folder,
    });
};
