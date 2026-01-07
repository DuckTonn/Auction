import api from './api';

const BASE_URL = '/auction-results';

class AuctionResultService {
    async getOrdersByWinner() {
        try {
            const response = await api.get(`${BASE_URL}/winner`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getOrdersByProductId(productId) {
        try {
            const response = await api.get(`${BASE_URL}/by-product/${productId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getOrderDetails(orderId) {
        try {
            const response = await api.get(`${BASE_URL}/${orderId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async submitPayment(orderId, formData) {
        try {
            // formData là FormData object chứa file và shipping_address
            const response = await api.post(`${BASE_URL}/${orderId}/submit-payment`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async confirmShipment(orderId, formData) {
        try {
            // formData là FormData object chứa file
            const response = await api.post(`${BASE_URL}/${orderId}/confirm-shipment`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async confirmReceipt(orderId) {
        try {
            const response = await api.post(`${BASE_URL}/${orderId}/confirm-receipt`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async cancelTransaction(orderId) {
        try {
            const response = await api.post(`${BASE_URL}/${orderId}/cancel-transaction`, { reason: '' });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export const auctionResultService = new AuctionResultService();