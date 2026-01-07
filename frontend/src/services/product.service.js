import api from './api';

class ProductService {

  // --- PUBLIC APIS ---

  // 1. Tìm kiếm sản phẩm với phân trang
  async searchProducts(keyword, page = 1, limit = 12, sortOrder = null) {
    try {
      // API của Backend: /products/search?keyword=...&page=...&limit=...&sortOrder=...
      const params = {
        keyword,
        page,
        limit
      };

      // Thêm sortOrder nếu có
      if (sortOrder) {
        params.sortOrder = JSON.stringify(sortOrder);
      }

      const response = await api.get('/products/search', { params });

      // Chuẩn hóa dữ liệu trả về để Frontend không bị lỗi
      const data = response.data.data || response.data || {};

      return data;

    } catch (error) {
      console.error("Lỗi searchProducts:", error);
      return [];
    }
  }

  // 2. Lấy chi tiết sản phẩm
  async getProductDetail(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi getProductDetail:", error);
      throw error;
    }
  }

  // 3. Lấy sản phẩm theo danh mục
  async getProductsByCategory(slug, page = 1, limit = 12, sortOrder = null) {
    try {
      const params = { page, limit };

      // Thêm sortOrder nếu có
      if (sortOrder) {
        params.sortOrder = JSON.stringify(sortOrder);
      }

      const response = await api.get(`/products/category/${slug}`, { params });
      return response.data;
    } catch (error) {
      console.error("Lỗi getProductsByCategory:", error);
      return { data: [] };
    }
  }

  // 4. Các API Top sản phẩm
  async getTopEnding() {
    try {
      const response = await api.get('/products/top-ending');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }

  async getTopPrice() {
    try {
      const response = await api.get('/products/top-price');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }

  async getTopBidded() {
    try {
      const response = await api.get('/products/top-bidded');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }

  // 5. Lấy sản phẩm liên quan
  async getRelatedProducts(slug) {
    try {
      const response = await api.get(`/products/category/${slug}/random`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi getRandomProductsByCategory (${slug}):`, error);
      return { data: [] };
    }
  }

  async getAllProducts() {
      try {
          // This hits the route: router.get('/', [checkAuth, checkRole('admin')], ...)
          const response = await api.get('/products'); 
          return response.data;
      } catch (error) {
          console.error("Lỗi getAllProducts:", error);
          throw error;
      }
  }

  // --- WATCH LIST / FAVORITE APIS ---

  // 6. Lấy danh sách yêu thích
  async getWatchList() {
    try {
      // API: GET /products/watch-list
      const response = await api.get('/products/watch-list');
      return response.data;
    } catch (error) {
      console.error("Lỗi getWatchList:", error);
      return { data: [] };
    }
  }

  // 7. Toggle yêu thích (Thêm/Xóa)
  async toggleWatchList(id) {
    try {
      // API: POST /products/:id/watch-list
      const response = await api.post(`/products/${id}/watch-list`);
      return response.data;
    } catch (error) {
      console.error("Lỗi toggleWatchList:", error);
      throw error;
    }
  }

  // 8. Kiểm tra trạng thái yêu thích của 1 sản phẩm
  async checkIsWatching(id) {
    try {
      // API: GET /products/:id/watch-list/check
      const response = await api.get(`/products/${id}/watch-list/check`);
      // Giả sử server trả về { isWatching: true/false }
      return response.data;
    } catch (error) {
      // Nếu lỗi (ví dụ chưa đăng nhập), mặc định là false
      return { isWatching: false };
    }
  }
  
  // 9. Mua ngay sản phẩm
  async buyProductNow(productId) {
    try {
      const response = await api.post(`/products/${productId}/buy-now`);
      return response.data;
    } catch (error) {
      console.error("Lỗi buyProductNow:", error);
      throw error;
    }
  }

  // --- SELLER API ---

  async createProduct(productData) {
    try {
      const response = await api.post('/products/create', productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi createProduct:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      throw error;
    }
  }

  async resellProduct(productId, newAuctionEndTime) {
    try {
      const response = await api.post(`/products/${productId}/resell`, {
        auction_end_time: newAuctionEndTime
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi resellProduct:", error);
      throw error;
    }
  }

  async getSellerProducts(page = 1) {
    try {
      const response = await api.get('/products/seller', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMinValidPrice(productId) {
    try {
      const response = await api.get(`/products/${productId}/min-price`);
      return response.data;
    } catch (error) {
      console.error("Lỗi getMinValidPrice:", error);
      throw error;
    }
  }

  async banBidder(productId, bidderId) {
    try {
      const response = await api.post(`/products/${productId}/ban`, { 
          bidder: bidderId 
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi banBidder:", error);
      throw error;
    }
  }

  async unbanBidder(productId, bidderId) {
    try {
      const response = await api.post(`/products/${productId}/unban`, { 
          bidder: bidderId 
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi unbanBidder:", error);
      throw error;
    }
  }

  async appendDescription(productId, descriptionContent) {
    try {
      const response = await api.post(`/products/${productId}/description`, {
        content: descriptionContent
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi appendDescription:", error);
      throw error;
    }
  }

  // --- QnA APIS ---
  async postQuestion(productId, questionText) {
    try {
      const response = await api.post(`/products/${productId}/questions`, {
        question_content: questionText
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi postQuestion:", error);
      throw error;
    }
  }

  async postAnswer(questionId, answerText) {
    try {
      const response = await api.post(`/qnas/${questionId}/answers`, {
        answer_content: answerText
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi postAnswer:", error);
      throw error;
    }
  }

  async getQuestions(productId) {
    try {
      const response = await api.get(`/products/${productId}/questions`);
      return response.data;
    } catch (error) {
      console.error("Lỗi getQuestions:", error);
      return { data: [] };
    }
  }

  // --- ADMIN APIS ---
  async getProducts(params = {}) {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error("Lỗi getProducts:", error);
      throw error;
    }
  }
  
  async cancelProduct(id) {
    try {
      const response = await api.post(`/products/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error("Lỗi adminCancelProduct:", error);
      throw error;
    }
  }
}


  
export const productService = new ProductService();