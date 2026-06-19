import api from './api'; // Dùng chung instance api đã cấu hình Refresh Token

class BidService {
  
  // 1. Đặt giá (place bid)
  async placeBid(productId, amount) {
    try {
      const response = await api.post(`/bids/${productId}/place`, {
        amount
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi placeBid:", error);
      
      // Xử lý lỗi để hiển thị thông báo dễ hiểu
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  }

  // 2. Lấy lịch sử đấu giá
  async getBidHistory(productId) {
    try {
      const response = await api.get(`/bids/${productId}/history`);
      // API shape: { message: '', data: [ ... ] }
      // Return the inner data array so callers can use `.map` directly.
      return response.data?.data || [];
    } catch (error) {
      console.error("Lỗi getBidHistory:", error);
      return [];
    }
  }

  // 3. Lấy giá đặt tối thiểu
  async getMinValidPrice(productId) {
    try {
      const response = await api.get(`/products/${productId}/min-price`);
      return response.data;
    } catch (error) {
      console.error("Lỗi getMinValidPrice:", error);
      // Fallback: tính toán tại frontend nếu API không có
      return this.calculateMinValidPrice(productId);
    }
  }

  // 4. Fallback: tính toán min valid price tại frontend (nếu API chưa có)
  async calculateMinValidPrice(productId) {
    try {
      // Lấy chi tiết sản phẩm trước
      const productRes = await api.get(`/products/${productId}`);
      const product = productRes.data.data;
      
      let minValidPrice;
      
      if (product.bid_count === 0) {
        minValidPrice = product.start_price;
      } else {
        minValidPrice = product.current_highest_price + product.bid_increment;
      }
      
      return {
        min_valid_price: minValidPrice
      };
    } catch (error) {
      console.error("Lỗi calculateMinValidPrice:", error);
      throw error;
    }
  }

  // 5. Lấy danh sách sản phẩm user đang tham gia đấu giá (active)
  async getActiveBiddedProducts() {
    try {
      // Endpoint: GET /bids/active-bidded-products
      const response = await api.get('/bids/active-bidded-products');
      // Theo docs: response.data = { message: "...", data: [...] }
      return response.data; 
    } catch (error) {
      console.error("Lỗi getActiveBiddedProducts:", error);
      throw error;
    }
  }
}

export const bidService = new BidService();