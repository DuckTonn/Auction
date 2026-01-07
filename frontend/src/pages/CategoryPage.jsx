import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/product.service';
import ProductSection from '../components/product/ProductSection';
import FilterDropdown from '../components/common/FilterDropdown'; 

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // --- 1. KHAI BÁO STATE ---
  const [products, setProducts] = useState([]); 
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryNotFound, setCategoryNotFound] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [sortOrder, setSortOrder] = useState('default');

  const page = parseInt(searchParams.get('page')) || 1; 
  const LIMIT = 6;
  const [totalPages, setTotalPages] = useState(1);

  // --- 2. GỌI API & CẬP NHẬT TỰ ĐỘNG ---
  useEffect(() => {
    const fetchAllData = async (isPolling = false) => {
      if (!isPolling) setLoading(true); 
      try {
        // Tạo sortOption object cho backend
        let sortOption = null;
        if (sortOrder !== 'default') {
          if (sortOrder === 'price_asc') sortOption = { current_highest_price: 1 };
          if (sortOrder === 'price_desc') sortOption = { current_highest_price: -1 };
          if (sortOrder === 'end_time_asc') sortOption = { auction_end_time: 1 };
          if (sortOrder === 'end_time_desc') sortOption = { auction_end_time: -1 };
        }

        const result = await productService.getProductsByCategory(slug, page, LIMIT, sortOption);
        
        // Kiểm tra nếu không có categoryName hoặc là message lỗi
        if (!result.categoryName || result.categoryName === "Lỗi tải dữ liệu" || result.categoryName === slug) {
          // Kiểm tra thêm nếu không có sản phẩm nào
          if (!result.data || result.data.length === 0) {
            setCategoryNotFound(true);
            setLoading(false);
            return;
          }
        }
        
        setCategoryNotFound(false);
        const responseData = result.data || {};
        const products = responseData.products || [];
        const pagination = responseData.pagination || {};
        
        const activeProducts = products.filter(p => p.auction_status === 'active');
        setProducts(activeProducts);
        setCategoryName(result.categoryName || slug);
        setDescription(result.description || ''); 
        setParentCategory(result.parentCategory || null);
        
        setTotalItems(pagination.total || 0);
        setTotalPages(pagination.totalPages || 1);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
        setCategoryNotFound(true);
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    fetchAllData(false);

    const interval = setInterval(() => { fetchAllData(true); }, 5000);
    return () => clearInterval(interval);
  }, [slug, page, LIMIT, sortOrder]);

  // --- 3. XỬ LÝ PHÂN TRANG --- 

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, slug]); 

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setSearchParams({ page: newPage });
  };

  const getPaginationItems = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  // --- 4. CẤU HÌNH OPTIONS ---
  const sortOptions = [ { label: "Mặc định", value: "default" }, { label: "Giá tăng dần", value: "price_asc" }, { label: "Giá giảm dần", value: "price_desc" }, { label: "Kết thúc gần", value: "end_time_asc" }, { label: "Kết thúc xa", value: "end_time_desc" } ];

  if (loading && products.length === 0) return <div className="min-h-screen bg-white flex justify-center items-center text-gray-600 text-xl font-semibold">Đang tải dữ liệu...</div>;

  // Hiển thị khi danh mục không tồn tại
  if (categoryNotFound) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center py-10 px-4">
        <div className="bg-blue-50 rounded-2xl p-12 max-w-md w-full text-center shadow-sm">
          <div className="text-gray-400 mb-6">
            <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 015.646 5.646 9.001 9.001 0 0020.354 15.354z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 11a3 3 0 106 0 3 3 0 00-6 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Không tìm thấy danh mục</h2>
          <p className="text-gray-600 mb-8">Danh mục bạn yêu cầu không tồn tại trong hệ thống hoặc đã bị xóa.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <div className="text-gray-500 text-sm font-medium mb-3 flex items-center flex-wrap">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition">TRANG CHỦ</Link>
            {parentCategory && ( <> <span className="mx-2"> / </span> <Link to={`/category/${parentCategory.slug}`} className="uppercase text-gray-500 hover:text-blue-600 transition">{parentCategory.category_name}</Link> </> )}
            <span className="mx-2"> / </span>
            <span className="uppercase tracking-wider text-blue-600 font-bold">{categoryName}</span>
          </div>
          <h2 className="text-3xl font-extrabold uppercase text-gray-900 tracking-wider border-l-4 border-blue-600 pl-6 leading-none md:text-4xl">{categoryName}</h2>
          {description && <p className="mt-4 text-gray-600">{description}</p>}
        </div>

        {products.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100 items-start sm:items-center justify-between">
              <span className="text-gray-700 font-bold">Sắp xếp</span>
              <div className="flex gap-3">
                  <FilterDropdown label="Sắp xếp" options={sortOptions} selectedValue={sortOrder} onSelect={(val) => { setSortOrder(val); setSearchParams({ page: 1 }); }} />
                  {sortOrder !== 'default' && (
                      <button onClick={() => { setSortOrder('default'); setSearchParams({ page: 1 }); }} className="text-sm text-red-500 hover:underline font-medium cursor-pointer">Đặt lại</button>
                  )}
              </div>
          </div>
        )}

        <ProductSection title={`${categoryName} (${totalItems} kết quả)`} products={products} loading={loading} />

        {products.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-500">
                <p className="text-xl mb-6">😞 Không tìm thấy sản phẩm nào trong danh mục này.</p>
                <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg">Quay về trang chủ</Link>
            </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2 select-none">
            <button onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"} onClick={() => handlePageChange(page - 1)} disabled={page === 1} className={`px-4 py-2 border rounded-lg transition-colors ${page === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-100'}`}>Trước</button>
            {getPaginationItems().map((item, index) => {
              if (item === '...') return <span key={`dots-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
              return <button onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"} key={item} onClick={() => handlePageChange(item)} className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${page === item ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}>{item}</button>;
            })}
            <button onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"} onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className={`px-4 py-2 border rounded-lg transition-colors ${page === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-100'}`}>Sau</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoryPage;