import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATH = path.join(__dirname, '../config/system.config.json');

class ConfigRepository {
  async getConfigs() {
    try {
      const data = await fs.readFile(FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { extend_threshold_minutes: 5, extend_duration_minutes: 10 }; // Trả về config mặc định nếu file không tồn tại
    }
  }

  async saveConfigs(newConfig) {
    await fs.writeFile(FILE_PATH, JSON.stringify(newConfig, null, 2), 'utf-8');
    return newConfig;
  }
}

export const configRepository = new ConfigRepository();