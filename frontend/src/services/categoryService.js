import api from './api';

const categoryService = {
  
  // Lấy danh sách danh mục (tree structure cho menu)
  getCategories: async () => {
    try {
      const response = await api.get('/categories/tree');
      return response.data;
    } catch (error) {
      console.error("Error fetching categories tree:", error);
      return { data: [] }; 
    }
  },

  // --- ADMIN APIs (THEO API LIST TXT) ---

  // Lấy tất cả danh mục (Admin - flat list có field exists_active_products)
  getAllCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết
  getCategoryBySlug: async (slug) => {
    try {
      const response = await api.get(`/categories/${slug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo danh mục mới
  createCategory: async (categoryData) => {
    try {
      // categoryData gồm: { category_name, description, parent_slug (optional) }
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật danh mục
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa danh mục
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default categoryService;
export { categoryService };