import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import axios from 'axios'; // added axios

import { userRepository } from '../repositories/user.repository.js';
import { tokenRepository } from '../repositories/token.repository.js';
import { otpRepository } from '../repositories/otp.repository.js';

import { dispatchEmail } from './email.service.queue.js';

import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'google_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'google_secret';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/oauth/callback';

// Facebook dùng trực tiếp API qua axios (không có OAuth2Client tương tự google-auth-library)
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || 'facebook_app_id';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || 'facebook_app_secret';
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5173/oauth/callback';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'github_client_id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'github_client_secret';
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5173/oauth/callback';

// Warn if placeholders detected to make testing easier
if (GOOGLE_CLIENT_ID.includes('google') || GOOGLE_CLIENT_SECRET.includes('google')) {
    console.warn('[AUTH SERVICE] Google client id/secret look like placeholders. Check env vars.');
}
if (FACEBOOK_APP_ID.includes('facebook') || FACEBOOK_APP_SECRET.includes('facebook')) {
    console.warn('[AUTH SERVICE] Facebook app id/secret look like placeholders. Check env vars.');
}
if (GOOGLE_REDIRECT_URI.includes('localhost') || FACEBOOK_REDIRECT_URI.includes('localhost')) {
    console.info('[AUTH SERVICE] Redirect URIs are set to localhost; ensure frontend redirect URIs match these and match provider app settings.');
}

// Google: sử dụng OAuth2Client để lấy/verify id_token.
// OAuth2Client được khởi tạo kèm redirect URI (dùng để exchange code và verify).
const googleClient = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);


class AuthService {
    async verifyCaptcha(captchaToken, options = {}) {
        try {
            if (!captchaToken) {
                return {
                    success: false,
                    message: 'Captcha token is required',
                    score: 0
                };
            }

            const { expectedAction = null, minScore = 0.5 } = options;

            const response = await axios.post(
                `https://www.google.com/recaptcha/api/siteverify`,
                null,
                {
                    params: {
                        secret: process.env.RECAPTCHA_SECRET_KEY,
                        response: captchaToken
                    }
                }
            );

            const { success, score, challenge_ts, hostname, action } = response.data;

            console.log('reCAPTCHA v3 verification:', {
                success,
                score,
                hostname,
                action,
                expectedAction,
                timestamp: challenge_ts
            });

            // Kiểm tra cho reCAPTCHA v3
            if (success && score !== undefined) {
                // Kiểm tra score
                if (score < minScore) {
                    return {
                        success: false,
                        message: `Score too low (${score.toFixed(2)} < ${minScore})`,
                        score,
                        minScore,
                        action
                    };
                }

                // Kiểm tra action nếu có
                if (expectedAction && action !== expectedAction) {
                    return {
                        success: false,
                        message: `Action mismatch: expected ${expectedAction}, got ${action}`,
                        score,
                        expectedAction,
                        receivedAction: action
                    };
                }
            }

            return {
                success,
                score: score || (success ? 1.0 : 0),
                message: success ? 'Captcha verified successfully' : 'Captcha verification failed',
                hostname,
                action,
                timestamp: challenge_ts,
                data: response.data
            };
        } catch (error) {
            console.error('CAPTCHA verification failed:', error);
            return {
                success: false,
                message: error.message || 'Failed to verify captcha',
                score: 0,
                error: error.message
            };
        }
    }
    async sendRegisterOtp(email, captchaToken) { // Thêm tham số captchaToken
        try {
            console.log('=== SERVICE: sendRegisterOtp called ===');
            console.log('Email:', email);
            console.log('Captcha token received:', !!captchaToken);
            console.log('Captcha token length:', captchaToken?.length || 0);

            // Xác thực CAPTCHA trước
            if (captchaToken) {
                console.log('Verifying captcha...');
                const captchaResult = await this.verifyCaptcha(captchaToken, {
                    expectedAction: 'register',
                    minScore: 0.5
                });

                console.log('Captcha verification result:', captchaResult);

                if (!captchaResult.success) {
                    throw new Error(captchaResult.message || 'CAPTCHA verification failed');
                }
            } else {
                console.warn('No captcha token provided, skipping verification');
                // Có thể ném lỗi nếu bạn muốn bắt buộc captcha:
                // throw new Error('Captcha token is required');
            }

            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) {
                throw new Error('Email đã tồn tại trong hệ thống!');
            }

            const otp = crypto.randomInt(100000, 999999).toString();
            const salt = await bcrypt.genSalt(10);
            const hashedOtp = await bcrypt.hash(otp, salt);

            await otpRepository.createOrUpdateOtp(email, hashedOtp);

            console.log(`[REGISTER OTP] Gửi tới ${email}: ${otp}`);
            dispatchEmail('SEND_OTP', {
                email,
                otp
            });

            return {
                success: true,
                message: 'OTP xác thực đã được gửi tới email của bạn.'
            };
        } catch (error) {
            console.error('Error in sendRegisterOtp:', error);
            throw error;
        }
    }

    async register(registerData) {
        const { email, password, full_name, address, otp } = registerData;

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

        // Check tồn tại user
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email đã tồn tại!');
        }

        // Hash mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await userRepository.create({
            email: email,
            password: hashedPassword,
            full_name: full_name,
            address: address,
            role: 'bidder' // Mặc định
        });

        // Dọn dẹp OTP
        await otpRepository.deleteByEmail(email);

        // Thêm provider local
        await userRepository.addProvider(
            newUser.id,
            "local",
            newUser.id.toString()
        );

        // Ẩn mật khẩu
        newUser.password = undefined;
        return newUser;
    }

    async login(user) {
        // user ở đây là user đã được xác thực bởi Passport

        return this.generateToken(user);
    }

    async loginWithGoogle(code) {
        const { tokens } = await googleClient.getToken(code);
        const idToken = tokens.id_token;

        if (!idToken) {
            throw new Error('Không thể lấy ID Token từ Google!');
        }

        // Lấy thông tin user
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const googleId = payload.sub;
        const email = payload.email;
        const fullName = payload.name;

        let user = await userRepository.findByProvider("google", googleId);

        if (!user) {
            // Kiểm tra xem email có bị xóa không
            const deletedUser = await userRepository.findByEmailIncludingDeleted(email);
            if (deletedUser && deletedUser.is_deleted) {
                throw new Error('Tài khoản này đã bị vô hiệu hóa!');
            }

            // Kiểm tra xem mail có tồn tại không
            const existingUser = await userRepository.findByEmail(email);
            if (!existingUser) {
                // Tạo mới
                user = await userRepository.createSocialUser({
                    full_name: fullName,
                    email,
                    provider: "google",
                    provider_id: googleId
                });
            }
            else {
                // Đã có user => thêm provider Google cho user đó
                if (!existingUser.full_name) {
                    existingUser.full_name = fullName;
                    await existingUser.save();
                }

                user = await userRepository.addProvider(
                    existingUser.id,
                    "google",
                    googleId
                );
            }
        }

        return this.generateToken(user);
    }

    async loginWithFacebook(code) {
        const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token`;
        const { data: tokenData } = await axios.get(tokenUrl, {
            params: {
                client_id: FACEBOOK_APP_ID,
                client_secret: FACEBOOK_APP_SECRET,
                redirect_uri: FACEBOOK_REDIRECT_URI,
                code: code,
            },
        });

        const accessToken = tokenData.access_token;
        if (!accessToken) {
            throw new Error('Không thể lấy Access Token từ Facebook!');
        }

        // Lấy thông tin User
        const userUrl = `https://graph.facebook.com/me`;
        const { data: profile } = await axios.get(userUrl, {
            params: {
                fields: 'id,name,email,picture',
                access_token: accessToken,
            },
        });

        const fbId = profile.id;
        const email = profile.email;
        const fullName = profile.name;

        // Nếu FB không trả về email (do đăng ký bằng số điện thoại), báo lỗi
        if (!email) {
            throw new Error('Facebook không trả về email cho tài khoản này. Vui lòng sử dụng phương thức đăng nhập khác.');
        }

        let user = await userRepository.findByProvider("facebook", fbId);

        if (!user) {
            // Kiểm tra xem email có bị xóa không
            const deletedUser = await userRepository.findByEmailIncludingDeleted(email);
            if (deletedUser && deletedUser.is_deleted) {
                throw new Error('Tài khoản này đã bị vô hiệu hóa!');
            }

            // Kiểm tra xem mail có tồn tại không
            const existingUser = await userRepository.findByEmail(email);
            if (!existingUser) {
                // Tạo mới
                user = await userRepository.createSocialUser({
                    full_name: fullName,
                    email,
                    provider: "facebook",
                    provider_id: fbId
                });
            } else {
                // Đã có user => thêm provider Facebook cho user đó
                if (!existingUser.full_name) {
                    existingUser.full_name = fullName;
                    await existingUser.save();
                }

                user = await userRepository.addProvider(
                    existingUser.id,
                    "facebook",
                    fbId
                );
            }
        }

        return this.generateToken(user);
    }

    async loginWithGitHub(code) {
        const tokenUrl = 'https://github.com/login/oauth/access_token';
        const { data: tokenData } = await axios.post(tokenUrl, {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            redirect_uri: GITHUB_REDIRECT_URI,
            code: code,
        }, {
            headers: { Accept: 'application/json' }
        });

        const accessToken = tokenData.access_token;
        if (!accessToken) {
            throw new Error('Không thể lấy Access Token từ GitHub!');
        }

        // Lấy thông tin User
        const userUrl = 'https://api.github.com/user';
        const { data: profile } = await axios.get(userUrl, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // Lấy email github
        let email = profile.email;
        if (!email) {
            const { data: emails } = await axios.get("https://api.github.com/user/emails", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            // Lấy email chính và đã xác minh
            const primaryEmail = emails.find(e => e.primary && e.verified);
            email = primaryEmail ? primaryEmail.email : null;
        }

        if (!email) throw new Error('Không tìm thấy email hợp lệ từ tài khoản GitHub!');

        const githubId = profile.id;
        const fullName = profile.name || profile.login;

        let user = await userRepository.findByProvider("github", githubId);

        if (!user) {
            // Kiểm tra xem email có bị xóa không
            const deletedUser = await userRepository.findByEmailIncludingDeleted(email);
            if (deletedUser && deletedUser.is_deleted) {
                throw new Error('Tài khoản này đã bị vô hiệu hóa!');
            }

            const existingUser = await userRepository.findByEmail(email);

            if (!existingUser) {
                // Tạo mới
                user = await userRepository.createSocialUser({
                    full_name: fullName,
                    email,
                    provider: "github",
                    provider_id: githubId
                });
            } else {
                // Liên kết provider mới
                user = await userRepository.addProvider(
                    existingUser.id,
                    "github",
                    githubId
                );
            }
        }

        return this.generateToken(user);
    }

    async generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        // Ký access token (15 phút)
        const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        // Ký refresh token (7 ngày)
        const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const refreshToken = jwt.sign(
            { id: user.id },
            REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        )

        // Lưu refresh token
        await tokenRepository.saveRefreshToken(user.id, refreshToken, expiry);

        return {
            accessToken: 'Bearer ' + accessToken,
            refreshToken: refreshToken
        }
    }

    async refreshToken(oldRefreshToken) {
        const tokenDB = await tokenRepository.findRefreshToken(oldRefreshToken);
        if (!tokenDB) {
            throw new Error('Refresh Token không hợp lệ hoặc hết hạn!');
        }

        // Xác thực chữ ký
        let payload;
        try {
            payload = jwt.verify(oldRefreshToken, REFRESH_TOKEN_SECRET);
        } catch (e) {
            await tokenRepository.deleteRefreshToken(oldRefreshToken);
            throw new Error('Refresh Token không hợp lệ!');
        }

        const user = await userRepository.findById(payload.id);
        if (!user) {
            throw new Error('Không tìm thấy người dùng ứng với Token!');
        }

        // Xóa Refresh Token cũ và tạo Tokens mới
        await tokenRepository.deleteRefreshToken(oldRefreshToken);

        return await this.generateToken(user);
    }

    async logout(refreshToken) {
        await tokenRepository.deleteRefreshToken(refreshToken);
        return { message: 'Đăng xuất thành công.' };
    }

    async changePassword(userId, oldPassword, newPassword) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('Không tìm thấy người dùng!');
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new Error('Mật khẩu cũ không chính xác!');
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        await userRepository.updatePassword(userId, newHashedPassword);
        return { message: 'Đổi mật khẩu thành công!' };
    }

    async forgotPassword(email) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Email không tồn tại trong hệ thống!');
        }
        if (user) {
            try {
                // Tạo OTP (6 số) và hash OTP trước khi đưa cho Database
                const otp = crypto.randomInt(100000, 999999).toString();
                const salt = await bcrypt.genSalt(10);
                const hashedOtp = await bcrypt.hash(otp, salt);

                // Đặt thời gian hết hạn (10 phút)
                const expiry = new Date(Date.now() + 10 * 60 * 1000);

                // Lưu OTP
                await otpRepository.createOrUpdateOtp(email, hashedOtp);

                // Gửi OTP (chưa hash) cho người dùng
                dispatchEmail('SEND_OTP', {
                    email,
                    otp
                });
                console.log('[FORGOT PASSWORD OTP]: ' + otp);
            } catch (e) {
                throw new Error('Lỗi khi xử lý forgotPassword: ' + e);
            }
        }

        return { message: 'OTP đang được gửi đi...' };
    }

    async resetPassword(email, otp, newPassword) {
        const otpRecord = await otpRepository.findByEmail(email);

        // Kiểm tra OTP có tồn tại không
        if (!otpRecord) {
            throw new Error('Mã OTP không tồn tại hoặc đã hết hạn!');
        }

        // So sánh mã OTP (hash)
        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            throw new Error('Mã OTP không chính xác!');
        }

        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Người dùng không tồn tại!');
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        await userRepository.updatePassword(user.id, newHashedPassword);

        // Xóa OTP
        await otpRepository.deleteByEmail(email);

        return { message: 'Mật khẩu đã được reset thành công.' };
    }

    async sendUpdatedEmailOtp(email) {
        try {
            console.log('=== SERVICE: sendUpdatedEmailOtp called ===');
            console.log('Email:', email);

            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) {
                throw new Error('Email đã tồn tại trong hệ thống!');
            }

            const otp = crypto.randomInt(100000, 999999).toString();
            const salt = await bcrypt.genSalt(10);
            const hashedOtp = await bcrypt.hash(otp, salt);

            await otpRepository.createOrUpdateOtp(email, hashedOtp);

            dispatchEmail('SEND_OTP', {
                email,
                otp
            });
            console.log(`[UPDATE EMAIL OTP] Gửi tới ${email}: ${otp}`);

            return {
                success: true,
                message: 'OTP xác thực đã được gửi tới email mới của bạn.'
            };
        } catch (error) {
            console.error('Error in sendUpdatedEmailOtp:', error);
            throw error;
        }
    }
}

export const authService = new AuthService();