import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (!DB_URI) {
    console.error("[MONGOOSE] Lỗi: Không tìm thấy biến môi trường MONGODB_URI trong file .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(DB_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4
    });

    console.log(`[MONGOOSE] Kết nối MongoDB Atlas thành công!`);
    console.log(`[MONGOOSE] Host: ${mongoose.connection.host}`);

  } catch (err) {
    console.error(`[MONGOOSE] Kết nối MongoDB thất bại: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
