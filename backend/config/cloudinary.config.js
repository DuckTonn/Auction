import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

import dotenv from 'dotenv';
dotenv.config();

// 1. Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// 2. Config Storage (Nơi quy định cách lưu file)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'auction-platform/products',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

// 3. Khởi tạo Multer upload middleware
const uploadCloud = multer({ storage });

export default uploadCloud;