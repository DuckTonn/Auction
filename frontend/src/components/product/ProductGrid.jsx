import React from 'react';
import { Link } from 'react-router-dom';

const ProductGrid = ({ products }) => {
  
  // Helper format tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Xử lý trường hợp không có sản phẩm
  if (!products || products.length === 0) {
    return <div className="empty-message">Không tìm thấy sản phẩm nào.</div>;
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <div key={product._id} className="product-card">
          
          {/* Ảnh sản phẩm */}
          <div className="card-image-wrapper">
            <img 
              src={product.images?.[0] || 'https://via.placeholder.com/400'} 
              alt={product.product_name}
              className="product-image"
            />
            <div className="badge">
              Đấu giá
            </div>
          </div>

          {/* Thông tin */}
          <div className="card-content">
            <h3 className="product-name">
              <Link to={`/auction/${product._id}`}>
                {product.product_name}
              </Link>
            </h3>
            
            <div className="card-footer">
              <div>
                <p className="price-label">Hiện tại:</p>
                <p className="price-value">
                  {formatCurrency(product.current_highest_price)}
                </p>
              </div>
              
              <Link 
                to={`/auction/${product._id}`} 
                className="detail-link"
              >
                Chi tiết &rarr;
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;