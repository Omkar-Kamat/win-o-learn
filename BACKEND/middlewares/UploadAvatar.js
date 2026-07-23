import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/Cloudinary.js';
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hackathon-platform/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
});
const uploadAvatar = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    },
});
export default uploadAvatar;
