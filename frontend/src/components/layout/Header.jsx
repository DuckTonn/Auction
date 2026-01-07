import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../common/SearchBar';
import CategoryMenu from '../home/CategoryMenu';
import MobileCategoryList from '../home/MobileCategoryList';
import { upgradeRequestService } from '../../services/upgradeRequestService';

import ToastNotification from '../common/ToastNotification';
import ConfirmDialog from '../common/ConfirmDialog';
import Button from '../common/Button';

export default function Header() {
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // --- Xử lí upgrade ---
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleUpgradeRequest = async () => {
    setShowConfirmDialog(true);
  };

  const confirmUpgradeRequest = async () => {
    setShowConfirmDialog(false);
    setIsUpgrading(true);
  
    try {
      await upgradeRequestService.createRequest();
      const message = 'Gửi yêu cầu nâng cấp thành công!';
      
      ToastNotification(message, 'success');
    } catch (error) {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra, thử lại sau!';
      
      ToastNotification(message, 'error');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(query.trim())}`);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSeller = user?.role === 'seller';
  const isBidder = user?.role === 'bidder';

  return (
    <header className="sticky top-0 bg-gray-900 shadow-lg z-50">
      <div className="py-3 md:py-4 px-4 md:px-6 flex items-center justify-between">
        {/* 1. Logo */}
        <Link 
          to="/" 
          className="text-white text-xl md:text-2xl font-bold shrink-0 hover:text-blue-400 transition-colors duration-200"
        >
          AuctionHub
        </Link>

        {/* 2. Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4 flex-1 mx-6">
          {/* Nút Danh mục & Dropdown */}
          <div 
            className="relative shrink-0"
            onMouseEnter={() => setShowCategories(true)} 
            onMouseLeave={() => setShowCategories(false)} 
          >
            <button className="bg-gray-800 text-white text-lg py-2.5 px-6 rounded-full min-w-[150px] hover:bg-gray-700 transition duration-200 flex items-center justify-center whitespace-nowrap border border-gray-700 cursor-pointer">
              <span className="mr-2">📂</span> Danh mục
            </button>
            
            <CategoryMenu 
                show={showCategories} 
                onHover={setShowCategories} 
                onClickCategory={(name) => console.log(name)} 
            />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* 3. Desktop User Actions */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {user ? (
            <>
            {isSeller ? (
              // Giao diện cho Seller
              <Link to="/product/create">
                <button className="
                    px-5 py-2.5 rounded-md font-semibold text-white 
                    bg-gradient-to-r from-blue-600 to-blue-700
                    hover:from-blue-700 hover:to-blue-800
                    transition-all duration-200
                    flex items-center gap-2
                    shadow-sm hover:shadow-md
                    border border-blue-500/20
                    cursor-pointer hover:scale-[1.02]
                ">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Đăng sản phẩm</span>
                </button>
              </Link>
            ) : isBidder ? (
              // Giao diện cho Bidder (Nút Nâng cấp)
              <button 
                onClick={handleUpgradeRequest}
                disabled={isUpgrading}
                className={`
                  px-5 py-2.5 rounded-md font-semibold
                  bg-gradient-to-r from-amber-500 to-orange-500
                  hover:from-amber-600 hover:to-orange-600
                  text-white
                  transition-all duration-200
                  flex items-center gap-2
                  shadow-sm hover:shadow-md
                  border border-amber-400/20
                  ${isUpgrading 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:scale-[1.02]'
                  }
                  cursor-pointer
                `}
              >
                {isUpgrading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span className="hidden sm:inline">Đang gửi...</span>
                      <span className="sm:hidden">...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="hidden sm:inline">Nâng cấp lên Seller</span>
                        <span className="sm:hidden">Nâng cấp</span>
                    </>
                )}
              </button>
            ) : (
              // Giao diện admin
              <div className="
                  px-5 py-2 rounded-lg border border-blue-500/30 bg-blue-500/10 
                  text-blue-400 font-mono font-bold tracking-widest text-sm
                  shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md
                  flex items-center gap-3 select-none cursor-default
              ">
                  <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  Quản trị viên
              </div>
            )}
            
            {/* USER DROPDOWN MENU */}
            <div className="relative" ref={userMenuRef}>
              {/* Nút Avatar + Tên */}
              <button
                onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-gray-200 hover:text-white hover:bg-gray-800 px-2 md:px-3 py-2 rounded-lg transition-all focus:outline-none select-none"
              >
                <div className="relative">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.full_name}&background=random&color=fff`} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                  />
                </div>
              </button>

              {/* Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Header nhỏ trong menu */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-bold text-white bg-blue-500 rounded-full uppercase">
                      {user.role}
                    </span>
                  </div>

                  {/* Các Links */}
                  {isSeller || isBidder ? (
                    <>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Hồ sơ cá nhân</Link>
                      <Link to="/profile/ratings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Đánh giá và phản hồi</Link>
                      <Link to="/manage-products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Quản lý sản phẩm</Link>
                      <Link to="/auctions/bidding" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Đang tham gia đấu giá</Link>
                      <Link to="/auctions/won" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Sản phẩm đã thắng</Link>
                      <Link to="/watch-list" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Danh sách yêu thích</Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer">Đăng xuất</button>
                    </>
                  ) : (
                    <>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Hồ sơ cá nhân</Link>
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Dashboard</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer">Đăng xuất</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            
            <Link to="/login">
              <Button variant="secondary" size="md" className="whitespace-nowrap">
                Đăng nhập
              </Button>
            </Link>

            <Link to="/signup">
              <Button variant="primary" size="md" className="whitespace-nowrap shadow-md shadow-blue-900/20">
                Đăng ký
              </Button>
            </Link>
          </>
        )}
        </div>

        {/* 4. Mobile Menu Button */}
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {showMobileMenu ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* 5. Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-800 bg-gray-900 animate-in slide-in-from-top duration-200">
          {/* Search Bar Mobile */}
          <div className="px-4 py-3 border-b border-gray-800">
            <SearchBar onSearch={(q) => { handleSearch(q); setShowMobileMenu(false); }} />
          </div>

          {/* Category List Mobile */}
          <div className="px-4 py-3 border-b border-gray-800">
            <button 
              onClick={() => setShowCategories(!showCategories)}
              className="w-full bg-gray-800 text-white text-base py-2.5 px-4 rounded-lg hover:bg-gray-700 transition duration-200 flex items-center justify-between whitespace-nowrap border border-gray-700 cursor-pointer"
            >
              <span><span className="mr-2">📂</span> Danh mục</span>
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCategories && (
              <MobileCategoryList onSelectCategory={(slug) => { 
                navigate(`/category/${slug}`); 
                setShowMobileMenu(false); 
                setShowCategories(false); 
              }} />
            )}
          </div>

          {/* User Actions Mobile */}
          <div className="px-4 py-3">
            {user ? (
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.full_name}&background=random&color=fff`} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-bold text-white bg-blue-500 rounded-full uppercase">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {isSeller ? (
                  <Link to="/product/create" onClick={() => setShowMobileMenu(false)}>
                    <button className="w-full px-4 py-2.5 rounded-md font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm border border-blue-500/20 cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Đăng sản phẩm
                    </button>
                  </Link>
                ) : isBidder ? (
                  <button 
                    onClick={() => { handleUpgradeRequest(); setShowMobileMenu(false); }}
                    disabled={isUpgrading}
                    className={`w-full px-4 py-2.5 rounded-md font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-sm border border-amber-400/20 ${isUpgrading ? 'opacity-60 cursor-not-allowed' : ''} cursor-pointer`}
                  >
                    {isUpgrading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Nâng cấp lên Seller
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full px-4 py-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 font-mono font-bold tracking-widest text-sm shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md flex items-center justify-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    Quản trị viên
                  </div>
                )}

                {/* Menu Links */}
                <div className="space-y-1">
                  {isSeller || isBidder ? (
                    <>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setShowMobileMenu(false)}>Hồ sơ cá nhân</Link>
                      <Link to="/profile/ratings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setShowMobileMenu(false)}>Đánh giá và phản hồi</Link>
                      <Link to="/manage-products" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setShowMobileMenu(false)}>Quản lý sản phẩm</Link>
                      <Link to="/auctions/bidding" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setShowMobileMenu(false)}>Đang tham gia đấu giá</Link>
                      <Link to="/auctions/won" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setShowMobileMenu(false)}>Sản phẩm đã thắng</Link>
                      <Link to="/watch-list" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setShowMobileMenu(false)}>Danh sách yêu thích</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setShowMobileMenu(false)}>Hồ sơ cá nhân</Link>
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setShowMobileMenu(false)}>Dashboard</Link>
                    </>
                  )}
                  <button onClick={() => { handleLogout(); setShowMobileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg transition-colors font-medium cursor-pointer">Đăng xuất</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                  <Button variant="secondary" size="md" fullWidth>
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setShowMobileMenu(false)}>
                  <Button variant="primary" size="md" fullWidth className="shadow-md shadow-blue-900/20">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {showConfirmDialog && (
        <ConfirmDialog
          message="Bạn có chắc chắn muốn gửi yêu cầu nâng cấp lên Seller trong 7 ngày?" 
          onYes={confirmUpgradeRequest}
          onNo={() => setShowConfirmDialog(false)}
        />
      )}
    </header>
  );
}