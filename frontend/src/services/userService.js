import api from './api';

const userService = {  
  // Lấy danh sách user (cho Admin)
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Xóa (Vô hiệu hóa) user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Khôi phục user
  restoreUser: async (userId) => {
    try {
      const response = await api.post(`/users/${userId}/restore`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Reset mật khẩu user
  resetUserPassword: async (userId) => {
    try {
      const response = await api.post(`/users/${userId}/reset-password`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // --- USER PROFILE APIs ---

  // Lấy profile hiện tại
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Đổi mật khẩu
  changePassword: async (passwordData) => {
      try {
          const response = await api.put('/users/password', passwordData);
          return response.data;
      } catch (error) {
          throw error;
      }
  },
  
  // Lấy đánh giá của user
  getRatings: async () => {
    try {
      const response = await api.get('/users/ratings');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;
export { userService };