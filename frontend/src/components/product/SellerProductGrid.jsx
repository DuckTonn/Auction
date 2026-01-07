import React from 'react';
import { Link } from 'react-router-dom';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);

  const d = date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const t = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `${d} ${t}`;
};

const getStatusBadge = (status) => {
  const statusConfig = {
    active: { label: 'Đang đấu giá', color: 'bg-green-500' },
    ended: { label: 'Đã kết thúc', color: 'bg-gray-500' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-500' },
    sold: { label: 'Đã bán', color: 'bg-blue-500' }
  };
  const config = statusConfig[status] || { label: status, color: 'bg-gray-400' };
  return (
    <span className={`${config.color} text-white text-xs font-semibold px-3 py-1 rounded-full uppercase`}>
      {config.label}
    </span>
  );
};

const getStatusText = (status) => {
  const statusMap = {
      'pending_payment': 'Chờ thanh toán',
      'pending_shipment': 'Chờ giao hàng',
      'shipping': 'Đang giao hàng',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
};

const getStatusStyle = (status) => {
  const styles = {
      pending_payment:  'bg-amber-50 text-amber-700 border-amber-200',
      pending_shipment: 'bg-blue-50 text-blue-700 border-blue-200',
      shipping:         'bg-purple-50 text-purple-700 border-purple-200',
      completed:        'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled:        'bg-red-50 text-red-700 border-red-200',
  };
  return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
};

export function SellerProductCard({ product, onAppendDescription, onRelistProduct, onViewDetail, onViewOrder }) {
  const status = product.auction_status;
  const imageUrl = product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';
  const currentPrice = product.current_highest_price || product.start_price || 0;
  const productName = product.product_name || product.name || 'Sản phẩm';
  const endTime = product.auction_end_time || product.end_time;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-100">
        <img 
          src={imageUrl} 
          alt={productName}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          {getStatusBadge(status)}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {productName}
        </h3>

        <div className="space-y-2 mb-4">
          {status === 'active' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Giá hiện tại</span>
              <span className="font-bold text-green-600">{formatCurrency(currentPrice)}</span>
            </div>
          )}
          
          {status === 'active' && endTime && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Kết thúc</span>
              <span className="text-sm text-gray-700">{formatDate(endTime)}</span>
            </div>
          )}

          {status === 'sold' && (
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Đã bán</span>
                </div>
                <span className="text-base font-bold text-blue-600">
                  {formatCurrency(product.final_price || currentPrice)}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 items-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`rounded-sm border px-3 py-1 text-sm font-semibold ${getStatusStyle(product.order?.status || 'Chưa có đơn hàng')}`}>
                    {getStatusText(product.order?.status || 'Chưa có đơn hàng')}
                  </span>
                </div>
                <button
                  onClick={() => onViewOrder(product)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Chi tiết</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {status === 'active' && (
            <div className="flex gap-2">
              <button
                onClick={() => onAppendDescription(product)}
                className="flex-1 bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Bổ sung mô tả
              </button>
              <button
                onClick={() => onViewDetail(product)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                Xem chi tiết
              </button>
            </div>
          )}

          {status === 'ended' && (
            <div className="flex gap-2">
              <button
                onClick={() => onRelistProduct(product)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                Bán lại
              </button>
              <button
                onClick={() => onViewDetail(product)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                Xem chi tiết
              </button>
            </div>
          )}

          {status === 'cancelled' && (
            <div className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 text-center">Sản phẩm đã bị hủy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SellerProductGrid({ 
  products, 
  onAppendDescription, 
  onRelistProduct, 
  onViewDetail,
  onViewOrder,
  emptyMessage = "Không có sản phẩm nào ở trạng thái này."
}) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có sản phẩm nào</h3>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <SellerProductCard 
          key={product._id || product.id} 
          product={product}
          onAppendDescription={onAppendDescription}
          onRelistProduct={onRelistProduct}
          onViewDetail={onViewDetail}
          onViewOrder={onViewOrder}
        />
      ))}
    </div>
  );
}
