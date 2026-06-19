import api from './api';

export const configService = {
  // Lấy tham số hệ thống
  async getSystemParams() {
    const response = await api.get('/admin/system-params');
    return response.data;
  },

  // Cập nhật tham số hệ thống
  async updateSystemParams(extend_threshold_minutes, extend_duration_minutes) {
    const response = await api.put('/admin/system-params', {
      extend_threshold_minutes,
      extend_duration_minutes
    });
    return response.data;
  }
};
