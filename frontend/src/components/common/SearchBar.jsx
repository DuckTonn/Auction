import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/product.service';
import searchIcon from '../../assets/search.png';
export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]); 
  const [trending, setTrending] = useState([]); 
  const [showDropdown, setShowDropdown] = useState(false);
  
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const DEFAULT_IMAGE = "https://placehold.co/50x50?text=No+Img";

  // --- 1. Load dữ liệu ban đầu ---
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setHistory(savedHistory);

    const fetchTrending = async () => {
        try {
            const res = await productService.getTopBidded();
            const products = res.data.products || res || [];
            setTrending(products.slice(0, 3));
        } catch (error) {
            console.error("Lỗi lấy trending:", error);
        }
    };

    fetchTrending();

    // Cập nhật ngầm mỗi 5 giây
    const interval = setInterval(() => { fetchTrending(); }, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. Quản lý Lịch sử ---
  const saveToHistory = (keyword) => {
      if (!keyword.trim()) return;
      let newHistory = [keyword, ...history.filter(item => item !== keyword)];
      newHistory = newHistory.slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const removeHistoryItem = (e, itemToRemove) => {
      e.stopPropagation(); 
      const newHistory = history.filter(item => item !== itemToRemove);
      setHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const clearAllHistory = () => {
      setHistory([]);
      localStorage.removeItem('searchHistory');
  };

  // --- 3. Debounce Search ---
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await productService.searchProducts(query, 1, 5);
        const products = res.products || [];
        const activeProducts = products.filter(p => p.auction_status === 'active');
        setSuggestions(activeProducts);
      } catch (error) {
        console.error("Lỗi gợi ý:", error);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click ra ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Các hành động điều hướng
  const handleSearch = () => {
    setShowDropdown(false);
    if (query.trim()) {
        saveToHistory(query.trim());
        onSearch(query);
        setQuery("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSelectProduct = (productId) => {
    setShowDropdown(false);
    navigate(`/product/${productId}`);
  };

  const handleSelectKeyword = (keyword) => {
      setQuery(keyword);
      saveToHistory(keyword);
      onSearch(keyword);
      setShowDropdown(false);  
      setQuery("");
  };

  return (
    <div ref={wrapperRef} className="relative flex w-full max-w-3xl group">
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        onKeyPress={handleKeyPress}
        className="w-full py-2.5 pl-5 pr-4 text-gray-800 bg-white border border-transparent rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 shadow-sm"
      />
      
      <button
        onClick={handleSearch}
        className="bg-blue-700 hover:bg-blue-600 text-white rounded-r-full px-6 flex items-center justify-center transition duration-200 border-l border-blue-800 shadow-sm cursor-pointer"
      >
        <img 
            src={searchIcon} 
            alt="Search" 
            className="w-6 h-5 invert brightness-0 object-contain" 
        />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 w-full bg-white rounded-xl shadow-2xl z-50 mt-2 border border-gray-100 overflow-hidden">
            
            {/* TRƯỜNG HỢP 1: Đang gõ chữ -> Hiện gợi ý sản phẩm */}
            {query.trim().length >= 2 ? (
                <>
                    {suggestions.length > 0 ? (
                        <ul className="py-2">
                            {suggestions.map((product) => (
                                <li 
                                    key={product._id}
                                    onClick={() => handleSelectProduct(product._id)}
                                    className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                                >
                                    <img 
                                        src={product.thumbnail || (product.images && product.images[0]) || DEFAULT_IMAGE} 
                                        alt={product.product_name}
                                        className="w-10 h-10 object-contain rounded bg-white border border-gray-200 mr-4 shrink-0"
                                        onError={(e) => {e.target.src = DEFAULT_IMAGE}}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-800 truncate">{product.product_name}</div>
                                        <div className="text-xs font-bold text-blue-600">
                                            {formatCurrency(product.current_highest_price || product.start_price)}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            <li 
                                onClick={handleSearch}
                                className="px-4 py-3 text-center text-sm font-semibold text-blue-700 cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                                Xem tất cả kết quả cho "{query}"
                            </li>
                        </ul>
                    ) : (
                        <div className="p-6 text-center text-gray-500 italic">Không tìm thấy sản phẩm nào</div>
                    )}
                </>
            ) : (
                /* TRƯỜNG HỢP 2: Chưa gõ gì -> Hiện Lịch sử & Xu hướng */
                <div className="p-4">
                    
                    {/* Phần Lịch sử tìm kiếm */}
                    {history.length > 0 && (
                        <div className="mb-5">
                            <div className="flex justify-between items-center mb-3">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">🕒 Lịch sử tìm kiếm</div>
                                <span 
                                    onClick={clearAllHistory}
                                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer underline decoration-red-200 hover:decoration-red-700 transition"
                                >
                                    Xóa tất cả
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {history.map((item, index) => (
                                    <span 
                                        key={index}
                                        onClick={() => handleSelectKeyword(item)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full cursor-pointer flex items-center transition border border-gray-200 group/tag"
                                    >
                                        {item}
                                        <span 
                                            onClick={(e) => removeHistoryItem(e, item)}
                                            className="ml-2 text-gray-400 hover:text-red-500 font-bold text-lg leading-none"
                                            title="Xóa từ này"
                                        >×</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Phần Xu hướng (Trending) */}
                    {trending.length > 0 && (
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">🔥 Đang được quan tâm</div>
                            <ul>
                                {trending.map(prod => (
                                    <li 
                                        key={prod._id}
                                        onClick={() => handleSelectProduct(prod._id)}
                                        className="flex justify-between items-center py-2 cursor-pointer border-b border-dashed border-gray-100 hover:bg-gray-50 px-2 rounded transition"
                                    >
                                        <div className="flex items-center flex-1 min-w-0">
                                            <img 
                                                src={prod.thumbnail || (prod.images && prod.images[0]) || DEFAULT_IMAGE} 
                                                className="w-8 h-8 object-contain mr-3 rounded border border-gray-200 bg-white"
                                                onError={(e) => {e.target.src = DEFAULT_IMAGE}}
                                                alt=""
                                            />
                                            <span className="text-sm text-gray-700 truncate">{prod.product_name}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full ml-2 border border-red-100">Hot</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
      )}
    </div>
  );
}