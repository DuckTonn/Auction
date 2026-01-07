import mongoose from 'mongoose';

import { userRepository }  from '../repositories/user.repository.js';
import { auctionResultRepository } from '../repositories/auction.result.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { tokenRepository } from '../repositories/token.repository.js';
import { otpRepository } from '../repositories/otp.repository.js';
import { bidRepository } from '../repositories/bid.repository.js';

import bcrypt from 'bcryptjs';

import { productService } from './product.service.js';
import { ratingService } from './rating.service.js';

import { recalculateAuctionState } from '../utils/auction.util.js';
import { executeTransaction } from '../../db/db.helper.js';
import { dispatchEmail } from '../services/email.service.queue.js';
class UserService {
    async updateProfile(userId, profileData) {
        const { full_name, phone_number, address, email, date_of_birth, otp } = profileData;

        const currentUser = await userRepository.findById(userId);
        if (!currentUser) {
            throw new Error('Không tìm thấy người dùng!');
        }

        // Kiểm tra cập nhật Email
        if (email && email !== currentUser.email) {
            // Validate đầu vào
            if (!otp) throw new Error('Vui lòng nhập mã OTP!');

            // Check OTP
            const otpRecord = await otpRepository.findByEmail(email);

            if (!otpRecord) {
                throw new Error('OTP không tồn tại hoặc đã hết hạn!');
            }

            const isMatch = await bcrypt.compare(otp, otpRecord.otp);
            if (!isMatch) {
                throw new Error('Mã OTP không chính xác!');
            }

            // Kiểm tra sự tồn tại của Email mới
            const existingUser = await userRepository.findByEmail(email);
            if (existingUser && existingUser._id.toString() !== userId.toString()) {
                throw new Error('Email này đã được sử dụng bởi tài khoản khác!');
            }
            // Cleanup OTP after successful validation
            await otpRepository.deleteByEmail(email);
        }

        const updateData = {};
        if (full_name) updateData.full_name = full_name;
        if (phone_number) updateData.phone_number = phone_number;
        if (address) updateData.address = address;
        if (email) updateData.email = email;
        if (date_of_birth) updateData.date_of_birth = new Date(date_of_birth);

        // Cập nhật
        const updateUser = await userRepository.updateData(userId, updateData);
        if (!updateUser) {
            throw new Error('Cập nhật thất bại!');
        }

        updateUser.password = undefined; // Ẩn mật khẩu
        return updateUser;
    }

    // Lấy thông tin cá nhân
    async getProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('Không tìm thấy người dùng!');
        }
        user.password = undefined;
        return user;
    }

    // --- ADMIN ---
    async deleteUser(userId) {
        // == Validate ==
        const hasPendingTransaction = await auctionResultRepository.existPendingTransaction(userId);
        if (hasPendingTransaction) {
            throw new Error('Người dùng còn giao dịch chưa hoàn tất (thanh toán/giao hàng).');
        }

        // == Xử lí data ==
        const activeProducts = await productService.getActiveProduct(userId);
        
        return await executeTransaction(async (session) => {
            // Hủy sản phẩm đang bán
            if (activeProducts && activeProducts.length > 0) {
                await Promise.all(
                    activeProducts.map(product =>
                        productService.cancelProduct(userId, product._id, false, session) 
                    )
                );
            }

            // Tìm sản phẩm user đang dẫn đầu hoặc đứng thứ 2 trước khi xóa
            const topProducts = await productRepository.findProductsUserIsTop(userId, true, session);

            // Invalidate tất cả các lượt ra giá của user này
            await bidRepository.banAllBidsByUser(userId, session);

            // Xóa các rating đã cho
            await ratingService.deleteGivenRatingsByUser(userId, session);

            // Xóa User
            const deletedUser = await userRepository.softDelete(userId, session);
            if (!deletedUser) {
                throw new Error('Người dùng không tồn tại!');
            }

            // Tính lại giá & Lưu (Clean up)
            if (topProducts && topProducts.length > 0) {
                await Promise.all(
                    topProducts.map(async (product) => {
                        // Xóa auto bid map của user
                        product.auto_bid_map.delete(userId.toString());

                        await recalculateAuctionState(product, null, session);

                        await bidRepository.scaleDownBids(product._id, product.current_highest_price, session);
                        
                        // Lưu xuống DB kèm session
                        return await productRepository.save(product, session);
                    })
                );
            }

            // Xóa Token
            await tokenRepository.deleteAllTokensByUser(userId, session);

            return { message: 'Tài khoản đã được vô hiệu hóa thành công!' };
        });
    }

    async restoreUser(userId) {
        const user = await userRepository.findByIdIncludingDeleted(userId);
        
        if (!user) {
            throw new Error('Không tìm thấy người dùng này.');
        }

        if (!user.is_deleted) {
            throw new Error('Tài khoản này đang hoạt động bình thường, không cần khôi phục.');
        }

        const restoredUser = await userRepository.restore(userId);

        return { 
            message: 'Khôi phục tài khoản thành công.', 
            user: restoredUser 
        };
    }

    async getAllUsers() {
        return await userRepository.findAll();
    }

    async getDeletedUsers() {
        return await userRepository.findDeleted();
    }

    async resetUserPassword(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('Không tìm thấy người dùng!');
        }

        const defaultPassword = "password123";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);
        
        dispatchEmail('NOTIFY_PASSWORD_RESET', {
            userEmail: user.email,
            temporaryPassword: defaultPassword
        });

        await userRepository.updatePassword(userId, hashedPassword);

        return { message: 'Mật khẩu đã được đặt lại về mặc định thành công!' };
    }
}

export const userService = new UserService();