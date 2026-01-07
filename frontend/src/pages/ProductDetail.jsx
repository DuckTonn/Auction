import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import { bidService } from '../services/bidService'
import { productService } from '../services/product.service'
import { auctionResultService } from '../services/auctionResultService.js'

// Import components
import ProductImages from '../components/productDetail/ProductImages'
import ProductInfo from '../components/productDetail/ProductInfo'
import BiddingSection from '../components/productDetail/BiddingSection'
import ProductDescription from '../components/productDetail/ProductDescription'
import ProductQA from '../components/productDetail/ProductQA'
import RelatedProducts from '../components/productDetail/RelatedProducts'
import AuctionStatusAlert from '../components/productDetail/AuctionStatusAlert'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  
  // STATE CHUNG (Lift State Up)
  const [product, setProduct] = useState(null)
  const [bidHistory, setBidHistory] = useState([])
  const [questions, setQuestions] = useState([])
  const [orderId, setOrderId] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [loadingRelated, setLoadingRelated] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [minValidPrice, setMinValidPrice] = useState(0)
  const [lastBid, setLastBid] = useState(0)
  
  const isRealSeller = user && product?.seller && (
    (typeof product.seller === 'string' && user?._id === product.seller) ||
    (typeof product.seller === 'object' && user?._id === product.seller._id)
  );

  const isBannedUser = product?.banned_bidder?.some(
    (id) => id.toString() === user?._id.toString()
  );

  const isNewbie = user && (user?.rating_count === 0) && product && !product.allow_newbie;

  // Hàm fetch data dùng chung (cho cả initial load, polling, và refresh thủ công)
  const fetchProductData = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true)

      // Lấy chi tiết sản phẩm
      const productRes = await productService.getProductDetail(id)
      const currentProduct = productRes.data
      setProduct(currentProduct)

      // Lấy lịch sử đấu giá
      try {
        const historyRes = await bidService.getBidHistory(id);
        const historyList = Array.isArray(historyRes) ? historyRes : (historyRes?.data || []);
        setBidHistory(historyList);
      } catch (err) {
        console.error("Lỗi silent fetch history:", err);
      }

      // Lấy danh sách hỏi đáp
      try {
        const qaRes = await productService.getQuestions(id);
        const qaList = Array.isArray(qaRes) ? qaRes : (qaRes?.data || []);
        setQuestions(qaList);
      } catch (err) {
        console.error("Lỗi silent fetch Q&A:", err);
      }

      // Lấy Related Products
      if (isInitialLoad && currentProduct?.category?.slug) {
          setLoadingRelated(true)
          try {
              const relatedRes = await productService.getRelatedProducts(currentProduct.category.slug)
              const productsArray = Array.isArray(relatedRes) ? relatedRes : (relatedRes?.data || [])
              setRelatedProducts(productsArray)
          } catch (e) {
              console.error("Lỗi lấy sản phẩm liên quan:", e)
          } finally {
              setLoadingRelated(false)
          }
      }

      // Lấy giá sàn
      const userId = user?._id;
      const sellerId = currentProduct.seller?._id || currentProduct.seller;
      const cond_getMinPrice = userId && currentProduct.seller && userId !== sellerId;
      
      if (cond_getMinPrice) {
        try {
          const minPriceRes = await productService.getMinValidPrice(id, userId);
          setMinValidPrice(minPriceRes.min_valid_price);
          setLastBid(minPriceRes.last_bid);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin giá:", error);
        }
      }

      // Lấy orderId (nếu product.auction_status === 'sold')
      if (currentProduct.auction_status === 'sold') {
        try {
          const order = await auctionResultService.getOrdersByProductId(currentProduct._id);
          if (order) {
            setOrderId(order._id);
          }
        } catch (error) {
          console.error("Lỗi khi lấy orderId:", error);
        }
      }

    } catch (error) {
      console.error("Lỗi khi tải chi tiết sản phẩm:", error);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, [id, user?._id]);

  useEffect(() => {
    let isMounted = true 

    // Wrapper để check mounted
    const safeFetch = async (initial) => {
        if(isMounted) await fetchProductData(initial);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Gọi lần đầu
    safeFetch(true)

    // Polling 5s/lần
    const interval = setInterval(() => {
      safeFetch(false)
    }, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [fetchProductData])

  const displayCategory = product?.category || null;

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Đang tải...</div>
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-blue-100 rounded-lg shadow-lg p-12 max-w-md w-full text-center">
          <div className="mb-6">
            <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 015.646 5.646 9.001 9.001 0 0020.354 15.354z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 11a3 3 0 106 0 3 3 0 00-6 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600 mb-8">Sản phẩm bạn yêu cầu không tồn tại trong hệ thống hoặc đã bị xóa.</p>
          <div className="flex gap-3 justify-center">
            <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              Trang chủ
            </a>
            <button onClick={() => window.history.back()} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium cursor-pointer">
              Quay lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="text-blue-600 hover:underline">Trang chủ</Link>
        <span className="mx-2">&gt;</span>
        <Link to={`/category/${displayCategory?.slug}`} className="text-blue-600 hover:underline">
          {displayCategory?.category_name}
        </Link>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-800 font-medium truncate">{product.product_name}</span>
      </nav>

      <AuctionStatusAlert
        product={product}
        user={user}
        orderId={orderId}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        <ProductImages
          product={product}
          selectedImage={selectedImage}
          onSelectImage={setSelectedImage}
        />

        <ProductInfo
          product={product}
          minValidPrice={minValidPrice}
          lastBid={lastBid}
          user={user}
          isRealSeller={isRealSeller}
        />
      </div>

      <BiddingSection
        product={product}
        minValidPrice={minValidPrice}
        user={user}
        isRealSeller={isRealSeller}
        isBannedUser={isBannedUser}
        isNewbie={isNewbie}
        bidHistory={bidHistory}
        onRefresh={() => fetchProductData(false)}
      />

      <ProductDescription 
        product={product}
        isRealSeller={isRealSeller}
        onRefresh={() => fetchProductData(false)}
      />

      {product.auction_status === 'active' && (
          <>
            <ProductQA 
              product={product}
              user={user}
              isRealSeller={isRealSeller}
              questions={questions}
              onRefresh={() => fetchProductData(false)}
            />
          </>
        )}

      <RelatedProducts products={relatedProducts} loading={loadingRelated} />
    </div>
  )
}