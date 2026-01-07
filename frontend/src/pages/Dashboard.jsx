import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auctionService } from '../services/auctionService';
import ProductSection from '../components/product/ProductSection';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [myAuctions, setMyAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyAuctions = async () => {
      try {
        if (user?._id) {
          const data = await auctionService.getAuctions({ user: user._id });
          setMyAuctions(data);
        }
      } catch (error) {
        console.error('Error fetching my auctions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyAuctions();
    }
  }, [user]);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      
      {/* Header Dashboard */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-800">
            Xin chào, <span className="text-blue-600">{user?.full_name}</span>!
          </h1>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>Email: <span className="font-medium text-gray-800">{user?.email}</span></p>
            <p>Role: <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold uppercase">{user?.role}</span></p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link to="/create-auction">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition duration-200 shadow-sm flex items-center cursor-pointer active:scale-95">
              <span className="mr-2 text-lg">⊕</span> Tạo đấu giá mới
            </button>
          </Link>
          <button 
            onClick={logout}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-5 py-2.5 rounded-lg font-medium transition duration-200 cursor-pointer active:scale-95"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Section: Đấu giá của tôi */}
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-4">
            Đấu giá của tôi
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-500 font-medium">Đang tải dữ liệu...</span>
          </div>
        ) : myAuctions.length > 0 ? (
          <ProductSection 
            title=""
            products={myAuctions}
          />
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500 text-lg mb-4">Bạn chưa có sản phẩm đấu giá nào.</p>
            <Link 
              to="/create-auction"
              className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-colors"
            >
              Tạo đấu giá đầu tiên ngay!
            </Link>
          </div>
        )}
      </section>

      {/* Section: Top sản phẩm */}
      <section>
        <ProductSection
          title="Top 5 sản phẩm gần kết thúc"
          products={[]} // Dữ liệu này sẽ được cập nhật từ API sau
        />
      </section>
    </div>
  );
}