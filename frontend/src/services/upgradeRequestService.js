import api from './api';

const BASE_URL = '/upgrade-requests'

class UpgradeRequestService {

    // --- BIDDER APIS ---
    async createRequest() {
        try {
            const response = await api.post(`${BASE_URL}/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // --- ADMIN API ---

    async getPendingList() {
        try {
            const response = await api.get(`${BASE_URL}/pending-list`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async updateRequestStatus(id, status) {
        try {
            const response = await api.post(`${BASE_URL}/${id}`, status);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export const upgradeRequestService = new UpgradeRequestService();