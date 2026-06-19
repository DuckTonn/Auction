import { configRepository as configRepo } from '../repositories/config.repository.js';

class ConfigService {
  async getSystemParams() {
    return await configRepo.getConfigs();
  }

  async updateSystemParams(extend_threshold_minutes, extend_duration_minutes) {
    if (typeof extend_threshold_minutes !== 'number' || typeof extend_duration_minutes !== 'number') {
      throw new Error('Params extend_threshold_minutes and extend_duration_minutes must be numbers');
    }

    // Lấy config cũ để đảm bảo không mất dữ liệu khác
    const currentConfig = await configRepo.getConfigs();

    // Merge dữ liệu mới
    const newConfig = {
      ...currentConfig,
      extend_threshold_minutes,
      extend_duration_minutes
    };

    // 4. Lưu xuống file
    return await configRepo.saveConfigs(newConfig);
  }
}

export const configService = new ConfigService();