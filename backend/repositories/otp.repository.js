import { OtpModel } from '../../db/schema.js';

class OtpRepository {
    async createOrUpdateOtp(email, hashedOtp) {
        return await OtpModel.findOneAndUpdate(
            { email },
            { otp: hashedOtp, createdAt: Date.now() },
            { upsert: true, new: true }
        );
    }

    async findByEmail(email) {
        return await OtpModel.findOne({ email });
    }

    async deleteByEmail(email) {
        return await OtpModel.deleteOne({ email });
    }
}

export const otpRepository = new OtpRepository();