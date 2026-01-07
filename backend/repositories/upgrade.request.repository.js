import { UpgradeRequest } from '../db/schema.js';

class UpgradeRequestRepository {
    async create(userId) {
        return await UpgradeRequest.create({ bidder: userId });
    }

    async findPendingRequests() {
        return await UpgradeRequest.find({ status: 'pending' })
        .populate('bidder', 'full_name email') 
        .sort({ createdAt: 1 }); 
    }

    async findById(id) {
        return await UpgradeRequest.findById(id)
            .populate('bidder', 'full_name email');
    }

    async updateStatus(id, status, approverId) {
        return await UpgradeRequest.findByIdAndUpdate(
            id,
            {
                status: status,
                approver: approverId 
            },
            { new: true }
        );
    }

    async findPendingByUserId(userId) {
        return await UpgradeRequest.findOne({
            bidder: userId,
            status: 'pending'
        });
    }
}

export const upgradeRequestRepository = new UpgradeRequestRepository();