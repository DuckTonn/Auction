import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import ProductSection from '../components/product/ProductSection';
import FilterDropdown from '../components/common/FilterDropdown';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import LoadingIndicator from '../components/common/LoadingIndicator';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');

  // --- 1. STATE QUẢN LÝ ---
  const [products, setProducts] = useState([]); // Dữ liệu từ API
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // State sắp xếp
  const [sortOrder, setSortOrder] = useState('default');

  // Cấu hình phân trang
  const page = parseInt(searchParams.get('page')) || 1;
  const LIMIT = 6;
  const [totalPages, setTotalPages] = useState(1);

  // --- 2. API & POLLING (Cập nhật dữ liệu với phân trang và sort) ---
  useEffect(() => {
    const fetchSearchResults = async (isPolling = false) => {
      if (!keyword) return;
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

        const results = await productService.searchProducts(keyword, page, LIMIT, sortOption);
        
        // Lấy dữ liệu từ API response
        const products = results.products || [];
        const pagination = results.pagination || {};
        
        const activeProducts = products.filter(p => p.auction_status === 'active');
        setProducts(activeProducts);
        
        // Sử dụng pagination từ API
        setTotalItems(pagination.total || 0);
        setTotalPages(pagination.totalPages || 1);
      } catch (error) {
        console.error("Lỗi search:", error);
        if (!isPolling) {
          setProducts([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    fetchSearchResults(false);

    // Cập nhật ngầm mỗi 5 giây
    const interval = setInterval(() => { fetchSearchResults(true); }, 5000);
    return () => clearInterval(interval);
  }, [keyword, page, LIMIT, sortOrder]);

  // --- 3. XỬ LÝ PHÂN TRANG ---
  // Scroll lên đầu khi đổi trang
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page, keyword]);

  // --- 5. HELPER & OPTIONS ---
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      // URL chỉ chứa keyword và page
      setSearchParams({ keyword, page: newPage });
    }
  };

  const getPaginationItems = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const sortOptions = [ { label: "Mặc định", value: "default" }, { label: "Giá tăng dần", value: "price_asc" }, { label: "Giá giảm dần", value: "price_desc" }, { label: "Kết thúc gần", value: "end_time_asc" }, { label: "Kết thúc xa", value: "end_time_desc" } ];

  // --- RENDER ---
  if (loading && products.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-white">
        <LoadingIndicator text="Đang tìm kiếm..." />
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <div className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">TRANG CHỦ</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700 font-bold">TÌM KIẾM</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                Kết quả cho: <span className="text-blue-600 italic">"{keyword}"</span>
            </h2>
            <p className="text-gray-500 mt-2">Tìm thấy {totalItems} sản phẩm</p>
          </div>
        </div>

        {/* Toolbar: Sort (Chỉ hiện khi có dữ liệu) */}
        {products.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100 items-start sm:items-center justify-between">
                <span className="text-gray-700 font-bold">Sắp xếp</span>
                <div className="flex gap-3">
                    <FilterDropdown label="Sắp xếp" options={sortOptions} selectedValue={sortOrder} onSelect={(val) => { setSortOrder(val); setSearchParams({ keyword, page: 1 }); }} />
                    {sortOrder !== 'default' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSortOrder('default'); setSearchParams({ keyword, page: 1 }); }}
                          className="text-red-600 hover:text-red-700"
                        >
                          Đặt lại
                        </Button>
                    )}
                </div>
            </div>
        )}

        {/* Danh sách & Phân trang */}
        {products.length === 0 ? (
             <EmptyState
               variant="minimal"
               icon="😞"
               title="Không tìm thấy sản phẩm"
               message="Không có sản phẩm nào khớp với từ khóa tìm kiếm."
               action={{
                 label: 'Quay về trang chủ',
                 to: '/',
                 variant: 'primary'
               }}
             />
        ) : (
             // Trường hợp 3: Có dữ liệu hiển thị
             <>
                <ProductSection products={products} loading={loading} />
                
                {totalPages >= 1 && (
                  <div className="mt-12 flex justify-center items-center space-x-2 select-none">
                    <Button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      variant="outline"
                      size="sm"
                      className="min-w-[72px]"
                    >
                      Trước
                    </Button>
                    {getPaginationItems().map((item, index) => {
                      if (item === '...') return <span key={`dots-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                      return (
                        <Button
                          key={item}
                          onClick={() => handlePageChange(item)}
                          variant={page === item ? 'primary' : 'outline'}
                          size="sm"
                          className="w-10 h-10 p-0"
                        >
                          {item}
                        </Button>
                      );
                    })}
                    <Button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      variant="outline"
                      size="sm"
                      className="min-w-[72px]"
                    >
                      Sau
                    </Button>
                  </div>
                )}
             </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;