import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/Cloudinary.js';
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hackathon-platform/banners',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
});
const uploadBanner = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    },
});
export default uploadBanner;
