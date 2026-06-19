import api from './api';

export const profileService = {
  // 1. Đổi mật khẩu
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      return { success: true, message: response.data.message || "Đổi mật khẩu thành công" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Đổi mật khẩu thất bại" };
    }
  },

  // 2. Cập nhật thông tin
  updateProfile: async (profileData) => {
    console.log("Dữ liệu gửi đi Update:", profileData);
    try {
      // Backend UserService: { full_name, phone_number, address, email, otp }
      const response = await api.put('/users/profile', profileData);
      return { success: true, data: response.data, message: "Cập nhật thành công" };
    } catch (error) {
      
      const serverMessage = 
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Lỗi khi cập nhật hồ sơ"; 

      return { success: false, message: serverMessage };
    }
  },

  // 3. Gửi OTP cập nhật Email (Endpoint riêng check trùng email)
  sendEmailUpdateOtp: async (email) => {
    try {
      const response = await api.post('/auth/send-updated-email-otp', { email });
      return {
        success: response.status === 200,
        message: response.data.message || 'OTP đã gửi đến email mới',
        data: response.data
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Không thể gửi OTP' 
      };
    }
  }

};