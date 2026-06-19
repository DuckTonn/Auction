import { upgradeRequestService } from "../services/upgrade.request.service.js";

class UpgradeRequestController {
    async createRequest(req, res) {
        try {
            const userId = req.user._id;
            const created = await upgradeRequestService.createRequest(userId);
            return res.status(200).json({
                message: 'Đã tạo request thành công!',
                data: created
            })
        } catch(error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getPendingList(req, res) {
        try {
            const list = await upgradeRequestService.getPendingList();
            return res.status(200).json({
                message: 'Đã lấy danh sách chờ thành công!',
                data: list
            })
        } catch(error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async updateRequestStatus(req, res) {
        try {
            const adminId = req.user._id;
            const { id } = req.params;
            const { status } = req.body;
            
            const approved = await upgradeRequestService.updateRequestStatus(id, adminId, status);
            
            return res.status(200).json({
                message: 'Đã cập nhật yêu cầu nâng cấp!',
                data: approved
            })
        } catch(error) {
            return res.status(400).json({ message: error.message });
        }
    }
}

export const upgradeRequestController = new UpgradeRequestController();