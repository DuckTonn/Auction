import { configService } from '../services/config.service.js';

class ConfigController {
  async getParams(req, res, next) {
    try {
      const data = await configService.getSystemParams();
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateParams(req, res, next) {
    try {
      const { extend_threshold_minutes, extend_duration_minutes } = req.body;
      
      const updatedData = await configService.updateSystemParams(extend_threshold_minutes, extend_duration_minutes);
      
      return res.json({ 
        success: true, 
        message: 'System params updated', 
        data: updatedData 
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const configController = new ConfigController();