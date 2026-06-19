import api from './api';

export const authService = {
  verifyCaptcha: async (captchaToken, action = 'register') => {
    try {
      const response = await api.post('/auth/verify-captcha', {
        captchaToken,
        action // Thêm action cho reCAPTCHA v3
      });

      console.log('Captcha verification response:', response.data);

      return {
        success: response.status === 200,
        isValid: response.data.success || false,
        message: response.data.message || '',
        score: response.data.score || 0,
        action: response.data.action,
        data: response.data
      };
    } catch (error) {
      console.error('CAPTCHA verification error:', error);

      return {
        success: false,
        isValid: false,
        message: error.response?.data?.message || 'Failed to verify captcha',
        error: error
      };
    }
  },

  // Đăng nhập - backend trả về { token: "Bearer <accessToken>" }
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    // Backend trả về { token: "Bearer <accessToken>" }
    return {
      accessToken: response.data.token
    };
  },

  // Đăng ký - backend expect: full_name, email, password, address, phone_number
  register: async (userData) => {
    const response = await api.post('/auth/register', {
      full_name: userData.name,
      email: userData.email,
      password: userData.password,
      address: userData.address,
      phone_number: userData.phone_number || '' // Thêm phone_number nếu có
    });
    return response.data;
  },

  // Lấy profile user
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Refresh token - backend dùng cookies
  refreshToken: async () => {
    // HttpOnly tự gửi
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Đăng nhập Google - backend expect code
  loginWithGoogle: async (code) => {
    const response = await api.post('/auth/google/login', { code });
    return { accessToken: response.data.token };
  },

  // Xử lý callback OAuth
  handleOAuthCallback: () => {
    return true;
  },

  loginWithFacebook: async (code) => {
    const response = await api.post('/auth/facebook/login', { code });
    return { accessToken: response.data.token };
  },

  loginWithGitHub: async (code) => {
    const response = await api.post('/auth/github/login', { code });
    return { accessToken: response.data.token };
  },

  // services/authService.js
  forgotPassword: async (email) => {
    try {
      console.log('=== FRONTEND: Calling forgot-password ===');
      console.log('Email:', email);

      const response = await api.post('/auth/forgot-password', { email });

      console.log('=== FRONTEND: Response received ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);

      return { success: true, message: response.data.message };
    } catch (error) {
      console.log('=== FRONTEND: Error occurred ===');
      console.log('Error:', error);
      console.log('Error response:', error.response);
      console.log('Error message:', error.message);

      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra'
      };
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra'
      };
    }
  },

  sendSignupOTP: async (email, captchaToken) => {
    try {
      const response = await api.post('/auth/send-otp', {
        email,
        captchaToken  // Thêm captcha token
      });

      return {
        success: response.status === 200,
        message: response.data.message || 'OTP đã được gửi',
        data: response.data,
        isEmailExists: false
      };
    } catch (error) {
      throw error;
    }
  },

  // Bước 2: Đăng ký với OTP (giữ nguyên)
  registerWithOTP: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
        address: userData.address,
        otp: userData.otp
      });

      return {
        success: response.status === 201,
        message: response.data.message || 'Đăng ký thành công',
        data: response.data
      };
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký';

      const isOTPError = status === 400 && (
        message.includes('OTP') ||
        message.includes('mã') ||
        message.includes('xác thực')
      );

      const isOTPExpired = status === 400 && message.includes('hết hạn');

      return {
        success: false,
        message: message,
        isOTPError: isOTPError,
        isOTPExpired: isOTPExpired
      };
    }
  }
};