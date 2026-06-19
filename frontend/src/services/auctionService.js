import api from './api';

export const auctionService = {

  // Lấy danh sách sản phẩm active (Trang chủ)
  getAuctions: async () => {
    if (IS_USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRODUCTS), 500));
    }
    const response = await api.get('/products/active');
    return response.data;
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (productName) => {
    if (IS_USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = MOCK_PRODUCTS.filter(p => 
            p.product_name.toLowerCase().includes(productName.toLowerCase())
          );
          resolve(result);
        }, 300);
      });
    }
    const response = await api.get(`/products/search?name=${encodeURIComponent(productName)}`);
    return response.data;
  },

  // Lấy chi tiết sản phẩm
  getAuctionById: async (id) => {
    if (IS_USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const product = MOCK_PRODUCTS.find(p => p._id === id);
          product ? resolve(product) : reject(new Error("Không tìm thấy sản phẩm"));
        }, 300);
      });
    }
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Đặt giá (Bid)
  placeBid: async (productId, bidAmount) => {
    if (IS_USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, new_price: bidAmount, message: "Đặt giá thành công (Mock)" });
        }, 800);
      });
    }
    const response = await api.post(`/products/${productId}/bid`, { amount: parseFloat(bidAmount) });
    return response.data;
  },

  // Tạo sản phẩm mới
  createAuction: async (auctionData) => {
    if (IS_USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true, message: "Tạo thành công (Mock)" }), 1000);
      });
    }
    const response = await api.post('/products', auctionData);
    return response.data;
  },

  // Lấy sản phẩm sắp kết thúc
  getEndingSoonAuctions: async () => {
    if (IS_USE_MOCK) {
      return new Promise((resolve) => {
        const sorted = [...MOCK_PRODUCTS].sort((a, b) => new Date(a.auction_end_time) - new Date(b.auction_end_time));
        resolve(sorted);
      });
    }
    const response = await api.get('/products/ending-soon');
    return response.data;
  }
};