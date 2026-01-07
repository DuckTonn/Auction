import { useState, useEffect } from 'react'
import ProductSection from '../components/product/ProductSection'
import { productService } from '../services/product.service'
import HeroSection from '../components/home/HeroSection'

export default function HomePage() {
  const [topEnding, setTopEnding] = useState([])
  const [topPrice, setTopPrice] = useState([])
  const [topBidded, setTopBidded] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomepageData = async (loading) => {
      try {
        if (loading) setLoading(true)

        const [endingRes, priceRes, biddedRes] = await Promise.all([
          productService.getTopEnding(),
          productService.getTopPrice(),
          productService.getTopBidded()
        ])

        setTopEnding(endingRes.data.products || [])
        setTopPrice(priceRes.data.products || [])
        setTopBidded(biddedRes.data.products || [])
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu homepage:', error)
      } finally {
        if (loading) setLoading(false)
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    fetchHomepageData(true)

    // Polling mỗi 60 giây
    const intervalId = setInterval(() => fetchHomepageData(false), 60000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="p-5 max-w-7xl mx-auto min-h-screen">
      <HeroSection />

      <div className="space-y-12 mt-8">
        <ProductSection
          title="Sắp kết thúc"
          products={topEnding}
          loading={loading}
        />
        <ProductSection
          title="Giá cao nhất"
          products={topPrice}
          loading={loading}
        />
        <ProductSection
          title="Đấu giá nhiều nhất"
          products={topBidded}
          loading={loading}
        />
      </div>
    </div>
  )
}