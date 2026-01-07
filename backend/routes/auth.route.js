import express from 'express';
import { attemptLogin, checkAuth } from '../middleware/auth.middleware.js';
import passport from 'passport';

export function AuthRoutes(authController) {
    const router = express.Router();

    // Gửi OTP (email)
    router.post('/send-otp', authController.sendOtp);

    router.post('/send-updated-email-otp', authController.sendUpdatedEmailOtp);

    // Đăng ký (input: email, password, full_name, address, phone_number)
    router.post("/register", authController.register);
    
    // Đăng nhập (input: email, password)
    router.post("/login", [attemptLogin], authController.login);
    
    // Refresh lại token (Cookies cần có refreshToken)
    router.post("/refresh", authController.refresh);
    
    // Logout (Cần có accessToken để xác định để đăng nhập)
    router.post("/logout", authController.logout);
    
    // Đăng nhập bằng google
    router.post("/google/login", authController.loginWithGoogle);

    // Đăng nhập bằng facebook
    router.post("/facebook/login", authController.loginWithFacebook);

    // Đăng nhập bằng github
    router.post("/github/login", authController.loginWithGitHub);
    
    // Quên mật khẩu
    router.post('/forgot-password', authController.forgotPassword);

    // Đặt lại mật khẩu
    router.post('/reset-password', authController.resetPassword);

    // Đổi mật khẩu
    router.post('/change-password', [checkAuth], authController.changePassword);

    router.post('/verify-captcha', authController.verifyCaptcha);
    
    // Hàm test get me (kiểm tra đăng nhập)
    router.get('/me', [checkAuth], (req, res) => {
        req.user.password = undefined;
        res.json({
            user: req.user
        })
    });

    return router;
}