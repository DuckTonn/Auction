import { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import ToastNotification from '../common/ToastNotification';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingIndicator from '../common/LoadingIndicator';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    category_name: '',
    description: '',
    parent_slug: ''
  });

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const fetchData = async () => {
    try {
      const res = await categoryService.getAllCategories();
      setCategories(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch lần đầu
    
    // Polling mỗi 30s
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      // Nếu danh mục có parent, tìm slug từ danh sách categories
      let parentSlug = '';
      if (category.parent) {
        const parentCategory = categories.find(c => c._id === category.parent._id);
        parentSlug = parentCategory?.slug || '';
      }
      
      setEditingCategory(category);
      setFormData({
        category_name: category.category_name,
        description: category.description || '',
        parent_slug: parentSlug
      });
    } else {
      setEditingCategory(null);
      setFormData({
        category_name: '',
        description: '',
        parent_slug: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Update
        await categoryService.updateCategory(editingCategory._id, formData);
        ToastNotification('Cập nhật danh mục thành công', 'success');
      } else {
        // Create
        await categoryService.createCategory(formData);
        ToastNotification('Tạo danh mục thành công', 'success');
      }
      setIsModalOpen(false);
      fetchData(); // Reload data ngay lập tức
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra';
      ToastNotification(msg, 'error');
    }
  };

  const handleDeleteClick = (category) => {
    if (category.exists_active_products) {
      ToastNotification('Không thể xóa danh mục đang có sản phẩm active', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xóa danh mục',
      message: `Bạn có chắc chắn muốn xóa danh mục "${category.category_name}"?`,
      onConfirm: async () => {
        try {
          await categoryService.deleteCategory(category._id);
          ToastNotification('Xóa danh mục thành công', 'success');
          fetchData();
        } catch (error) {
          ToastNotification(error.response?.data?.message || 'Lỗi khi xóa', 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  if (loading && categories.length === 0) return <LoadingIndicator />;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Danh mục</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Thêm danh mục
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 border-b">Tên danh mục</th>
              <th className="p-4 border-b">Slug</th>
              <th className="p-4 border-b">Danh mục cha</th>
              <th className="p-4 border-b">Mô tả</th>
              <th className="p-4 border-b">Trạng thái</th>
              <th className="p-4 border-b text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{cat.category_name}</td>
                <td className="p-4 text-gray-500">{cat.slug}</td>
                <td className="p-4 text-blue-600">
                  {cat.parent ? cat.parent.category_name : '-'}
                </td>
                <td className="p-4 text-gray-500 truncate max-w-xs">{cat.description}</td>
                <td className="p-4">
                  {cat.exists_active_products ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Trống
                    </span>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => handleOpenModal(cat)}
                    className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1"
                  >
                    Sửa
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(cat)}
                    disabled={cat.exists_active_products}
                    className={`font-medium px-2 py-1 ${
                      cat.exists_active_products 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-red-600 hover:text-red-800'
                    }`}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={formData.category_name}
                  onChange={(e) => setFormData({...formData, category_name: e.target.value})}
                  placeholder="Nhập tên danh mục..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục cha</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={formData.parent_slug}
                  onChange={(e) => setFormData({...formData, parent_slug: e.target.value})}
                >
                  <option value="">-- Không có (Danh mục gốc) --</option>
                  {categories
                    .filter(c => c._id !== editingCategory?._id) // Không chọn chính mình làm cha
                    .map(c => (
                      <option key={c._id} value={c.slug}>
                        {c.category_name}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Mô tả ngắn về danh mục..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition shadow-sm"
                >
                  {editingCategory ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <ConfirmDialog 
          message={confirmDialog.message}
          onYes={confirmDialog.onConfirm}
          onNo={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}