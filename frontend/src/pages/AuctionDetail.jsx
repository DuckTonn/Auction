import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { products } from '../data/products';

export default function AuctionDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id === parseInt(id));
  
  // Lưu ý: Cần kiểm tra product tồn tại trước khi dùng useState để tránh lỗi màn hình trắng
  const [bid, setBid] = useState(product ? product.price : 0);
  const [message, setMessage] = useState('');

  if (!product) return <div className="p-5">Không tìm thấy sản phẩm</div>;

  const handleBid = () => {
    if (bid <= product.price) {
      setMessage('⚠️ Giá phải cao hơn giá hiện tại!');
    } else {
      product.price = bid;
      setMessage('✅ Đặt giá thành công!');
    }
  };

  return (
    // style={{ padding: '20px' }} -> p-5
    <div className="p-5">
      {/* Link quay lại */}
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Quay lại danh sách
      </Link>

      {/* Tên sản phẩm */}
      <h2 className="text-2xl font-bold mb-4">{product.name}</h2>

      {/* style={{ width: '300px', borderRadius: '10px' }} */}
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-[300px] rounded-[10px] mb-4" 
      />

      <p className="mb-4 text-lg">
        Giá hiện tại: <span className="font-bold">{product.price.toLocaleString()}₫</span>
      </p>

      {/* Input & Button */}
      <div className="flex items-center">
        <input
          type="number"
          value={bid}
          onChange={(e) => setBid(Number(e.target.value))}
          // style={{ padding: '5px', marginRight: '10px' }}
          // Thêm border để nhìn thấy khung nhập
          className="p-1.5 mr-2.5 border border-gray-400 rounded"
        />
        
        <button 
          onClick={handleBid}
          // Thêm chút màu cho nút bấm để giống nút
          className="bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300 border border-gray-400"
        >
          Đặt giá
        </button>
      </div>

      <p className="mt-3 text-red-600 font-medium">{message}</p>
    </div>
  );
}