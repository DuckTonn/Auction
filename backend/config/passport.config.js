import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import bcrypt from 'bcryptjs';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import { userRepository } from "../repositories/user.repository.js";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access_token_secret';

// ===== CHIẾN LƯỢC ĐĂNG NHẬP (EMAIL + PASSWORD) =====
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            const errorMessage = "Email hoặc mật khẩu không chính xác!";

            // Tìm user
            const user = await userRepository.findByEmail(email);

            if (!user) {
                return done(null, false, { message: errorMessage });
            }

            // Dùng brypt để so sánh
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return done(null, false, { message: errorMessage });
            }

            return done(null, user);

        } catch (error) {
            return done(error);
        }
    }
));

// === CHIẾN LƯỢC JWT (BẢO VỆ ROUTES) ===
passport.use(new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy token từ "Bearer <token>"
        secretOrKey: ACCESS_TOKEN_SECRET
    },
    async (jwt_payload, done) => {
        try {
            const user = await userRepository.findById(jwt_payload.id);

            if (user) {
                return done(null, user); // User hợp lệ, gắn user vào req.user
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    }
));