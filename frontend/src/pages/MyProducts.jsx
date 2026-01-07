import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/product.service';
import { auctionResultService } from '../services/auctionResultService.js';
import ToastNotification from '../components/common/ToastNotification.jsx'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TextEditor from '../components/common/TextEditor';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SellerProductGrid from '../components/product/SellerProductGrid';

const MyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showDescModal, setShowDescModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newDescription, setNewDescription] = useState('');
  const [descLoading, setDescLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [showResellModal, setShowResellModal] = useState(false);
  const [resellProduct, setResellProduct] = useState(null);
  const [newAuctionEndTime, setNewAuctionEndTime] = useState('');
  const [resellLoading, setResellLoading] = useState(false);
  const [showResellConfirm, setShowResellConfirm] = useState(false);

  useEffect(() => {
    fetchProducts(true);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const interval = setInterval(() => {
      fetchProducts(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async (loading) => {
    try {
      if (loading) {
        setLoading(true);
      }
      const response = await productService.getSellerProducts();
      const data = response.data || response.products || [];
      const products = data.products || data || [];

      // Nếu product đã sold, lấy thông tin order tương ứng cho product đó
      for (let product of products) {
        if (product.auction_status === 'sold') {
          try {
            const order = await auctionResultService.getOrdersByProductId(product._id || product.id);
            product.order = order;
          } catch (error) {
            console.error(`Lỗi lấy đơn hàng cho sản phẩm ${product._id || product.id}:`, error);
          }
        }
      }

      setProducts(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
      if (loading) {
        ToastNotification("Không thể tải danh sách sản phẩm", "error");
        setProducts([]);
      }
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  };

  const handleAppendDescription = (product) => {
    setSelectedProduct(product);
    setNewDescription('');
    setShowDescModal(true);
  };

  const handleDescriptionChange = (content) => {
    setNewDescription(content);
  };

  const handleSubmitDescription = () => {
    const strippedContent = newDescription.replace(/<[^>]*>/g, '').trim();
    if (!strippedContent) {
      return ToastNotification("Vui lòng nhập nội dung mô tả", "warning");
    }
    setShowConfirm(true);
  };

  const submitAppendDescription = async () => {
    setShowConfirm(false);

    try {
      setDescLoading(true);
      const productId = selectedProduct._id || selectedProduct.id;
      const response = await productService.appendDescription(productId, newDescription);
      
      ToastNotification("Đã bổ sung mô tả thành công!", "success");
      setShowDescModal(false);
      setNewDescription('');
      fetchProducts();
    } catch (error) {
      const message = error?.response?.data?.message || "Có lỗi xảy ra!";
      ToastNotification(message, 'error');
    } finally {
      setDescLoading(false);
    }
  };

  const handleRelistProduct = (product) => {
    setResellProduct(product);
    setNewAuctionEndTime('');
    setShowResellModal(true);
  };

  const handleSubmitResell = () => {
    if (!newAuctionEndTime) {
      return ToastNotification("Vui lòng chọn ngày kết thúc đấu giá", "warning");
    }

    const selectedDate = new Date(newAuctionEndTime);
    const now = new Date();

    if (selectedDate <= now) {
      return ToastNotification("Ngày kết thúc phải sau thời điểm hiện tại", "warning");
    }

    setShowResellConfirm(true);
  };

  const submitResellProduct = async () => {
    setShowResellConfirm(false);

    try {
      setResellLoading(true);
      const productId = resellProduct._id || resellProduct.id;
      await productService.resellProduct(productId, newAuctionEndTime);
      
      ToastNotification("Đã đăng lại sản phẩm thành công!", "success");
      setShowResellModal(false);
      setNewAuctionEndTime('');
      fetchProducts();
    } catch (error) {
      const message = error?.response?.data?.message || "Có lỗi xảy ra khi bán lại sản phẩm!";
      ToastNotification(message, 'error');
    } finally {
      setResellLoading(false);
      setResellProduct(null);
      setNewAuctionEndTime('');
    }
  };

  const handleViewDetail = (product) => {
    const productId = product._id || product.id;
    navigate(`/product/${productId}`);
  };

  const handleViewOrder = async (product) => {
    const order = product.order;

    if (!order) {
      return ToastNotification("Không tìm thấy đơn hàng liên quan đến sản phẩm này", "error");
    }

    navigate(`/orders/${order._id}`);
  };

  const filterProducts = (status) => {
    let filtered = products;
    
    // Filter theo trạng thái đấu giá
    if (status !== 'all') {
      filtered = filtered.filter(p => p.auction_status === status);
    }
    
    // Filter theo trạng thái đơn hàng nếu tab 'Đã bán' được chọn
    if (status === 'sold' && orderStatusFilter !== 'all') {
      filtered = filtered.filter(p => p.order?.status === orderStatusFilter);
    }
    
    return filtered;
  };

  const filteredProducts = filterProducts(activeTab);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <ToastContainer />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Quản lý sản phẩm</h1>
          <p className="text-gray-500">Quản lý danh sách đấu giá và theo dõi giao dịch</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tất cả
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {products.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'active'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đang đấu giá
              <span className="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                {products.filter(p => p.auction_status === 'active').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('ended')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'ended'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đã kết thúc
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {products.filter(p => p.auction_status === 'ended').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'sold'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đã bán
              <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                {products.filter(p => p.auction_status === 'sold').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'cancelled'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đã hủy
              <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                {products.filter(p => p.auction_status === 'cancelled').length}
              </span>
            </button>
          </div>
        </div>

        {activeTab === 'sold' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setOrderStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  orderStatusFilter === 'all'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setOrderStatusFilter('pending_payment')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  orderStatusFilter === 'pending_payment'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chờ thanh toán
              </button>
              <button
                onClick={() => setOrderStatusFilter('pending_shipment')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  orderStatusFilter === 'pending_shipment'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chờ giao hàng
              </button>
              <button
                onClick={() => setOrderStatusFilter('shipping')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  orderStatusFilter === 'shipping'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đang giao hàng
              </button>
              <button
                onClick={() => setOrderStatusFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  orderStatusFilter === 'completed'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đã hoàn thành
              </button>
              <button
                onClick={() => setOrderStatusFilter('cancelled')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  orderStatusFilter === 'cancelled'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đã hủy
              </button>
            </div>
          </div>
        )}

        <SellerProductGrid
          products={filteredProducts}
          onAppendDescription={handleAppendDescription}
          onRelistProduct={handleRelistProduct}
          onViewDetail={handleViewDetail}
          onViewOrder={handleViewOrder}
          emptyMessage={activeTab === 'all' 
            ? 'Bạn chưa có sản phẩm nào. Hãy tạo sản phẩm mới để bắt đầu!' 
            : 'Không có sản phẩm nào ở trạng thái này.'}
        />
      </div>

      {showDescModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Bổ sung mô tả sản phẩm</h3>
              <button
                onClick={() => setShowDescModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900 mb-1">{selectedProduct.product_name || selectedProduct.name}</p>
              <p className="text-sm text-gray-500">Mô tả bổ sung sẽ được thêm vào cuối mô tả hiện tại</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung bổ sung
              </label>
              <TextEditor
                value={newDescription}
                onChange={handleDescriptionChange}
                placeholder="Nhập nội dung mô tả bổ sung..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDescModal(false);
                  setNewDescription('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitDescription}
                disabled={descLoading}
                className="flex-1 bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {descLoading ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && selectedProduct && (
        <ConfirmDialog
          message={
            <>
              <span>Bạn có chắc chắn muốn bổ sung mô tả cho sản phẩm:</span><br />
              <span className="font-semibold">{selectedProduct.product_name || selectedProduct.name}</span><br />
            </>
          }
          onYes={submitAppendDescription}
          onNo={() => setShowConfirm(false)}
        />
      )}

      {showResellModal && resellProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Bán lại sản phẩm</h3>
              <button
                onClick={() => {
                  setShowResellModal(false);
                  setResellProduct(null);
                  setNewAuctionEndTime('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900 mb-1">{resellProduct.product_name || resellProduct.name}</p>
              <p className="text-sm text-gray-500">Sản phẩm sẽ được đăng lại với thời gian kết thúc mới</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày kết thúc đấu giá mới <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={newAuctionEndTime}
                onChange={(e) => setNewAuctionEndTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                onFocus={(e) => {
                  e.target.min = new Date().toISOString().slice(0, 16);
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                Chọn thời gian kết thúc phải sau thời điểm hiện tại
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResellModal(false);
                  setNewAuctionEndTime('');
                  setResellProduct(null);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitResell}
                disabled={resellLoading}
                className="flex-1 bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {resellLoading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResellConfirm && resellProduct && (
        <ConfirmDialog
          message={
            <>
              <span>Bạn có chắc chắn muốn đăng lại sản phẩm:</span><br />
              <span className="font-semibold">{resellProduct.product_name || resellProduct.name}</span><br />
              <span className="text-sm text-gray-600">với ngày kết thúc: {new Date(newAuctionEndTime).toLocaleString('vi-VN')}</span>
            </>
          }
          onYes={submitResellProduct}
          onNo={() => setShowResellConfirm(false)}
        />
      )}
    </div>
  );
};

export default MyProducts;
