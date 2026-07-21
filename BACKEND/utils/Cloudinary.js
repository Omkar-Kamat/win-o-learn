import cloudinary from "../config/Cloudinary.js";

export const DeleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return;

  return await cloudinary.uploader.destroy(publicId);
};

export const UploadImageToCloudinary = async (
  filePath,
  folder = "win-o-learn"
) => {
  return await cloudinary.uploader.upload(filePath, {
    folder,
  });
};