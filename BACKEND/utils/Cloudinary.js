import cloudinary from '../config/Cloudinary.js';
export // Removes the specified image from cloudinary. 
// Removes the specified image from cloudinary using the provided parameters: publicId. 
const DeleteImageFromCloudinary = async publicId => {
  if (!publicId) return;
  return await cloudinary.uploader.destroy(publicId);
};
export // Uploads image to cloudinary. 
// Uploads image to cloudinary using the provided parameters: filePath, folder. 
const UploadImageToCloudinary = async (filePath, folder = 'win-o-learn') => await cloudinary.uploader.upload(filePath, {
  folder: folder
});