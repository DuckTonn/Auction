import { upgradeRequestRepository }  from '../repositories/upgrade.request.repository.js';
import { userRepository }  from '../repositories/user.repository.js';
import { dispatchEmail } from './email.service.queue.js';
class UpgradeRequestService {
    async createRequest(userId) {
        const existingRequest = await upgradeRequestRepository.findPendingByUserId(userId);
        if (existingRequest) {
            throw new Error('Bạn đã có yêu cầu đang chờ phê duyệt. Vui lòng đợi!');
        }
        return await upgradeRequestRepository.create(userId);
    }
    
    async getPendingList() {
        return await upgradeRequestRepository.findPendingRequests();
    }

    async updateRequestStatus(requestId, adminId, status) {
        const validStatuses = ['approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            throw new Error('Trạng thái không hợp lệ');
        }

        const request = await upgradeRequestRepository.findById(requestId);
        if (!request) throw new Error('Yêu cầu không tồn tại');
        if (request.status !== 'pending') throw new Error('Yêu cầu này đã được xử lý trước đó');

        if (status === 'approved') {
            const userIdToUpgrade = request.bidder._id || request.bidder;
            try {
                await userRepository.upgradeSeller(userIdToUpgrade);
                if (request.bidder.email) {
                    dispatchEmail('NOTIFY_UPGRADE_APPROVED', {
                        userEmail: request.bidder.email,
                    });
                }
            } catch (e) {
                throw new Error('Lỗi khi nâng cấp user, huỷ thao tác duyệt.');
            }
        }
        if (status === 'rejected') {
            if (request.bidder.email) {
                dispatchEmail('NOTIFY_UPGRADE_REJECTED', {
                    userEmail: request.bidder.email,
                });
            }
        }

        const updatedRequest = await upgradeRequestRepository.updateStatus(requestId, status, adminId);
        return updatedRequest;
    }
}
export const upgradeRequestService = new UpgradeRequestService();