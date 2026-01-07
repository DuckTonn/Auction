import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

export default function ProductImages({ product, selectedImage, onSelectImage }) {
    const allImages = [product.thumbnail, ...(product.images || [])]
    const [isAutoPlay, setIsAutoPlay] = useState(true)
    const [direction, setDirection] = useState('next')

    // Auto play slideshow
    useEffect(() => {
        if (!isAutoPlay || allImages.length <= 1) return
        
        const interval = setInterval(() => {
            handleNext()
        }, 3000) // Chuyển slide mỗi 3 giây
        
        return () => clearInterval(interval)
    }, [isAutoPlay, selectedImage, allImages.length])

    const handleNext = () => {
        setDirection('next')
        onSelectImage((selectedImage + 1) % allImages.length)
    }

    const handlePrev = () => {
        setDirection('prev')
        onSelectImage((selectedImage - 1 + allImages.length) % allImages.length)
    }

    const handleDotClick = (index) => {
        setDirection(index > selectedImage ? 'next' : 'prev')
        onSelectImage(index)
    }

    return (
        <div>
            {/* Main Slideshow */}
            <div className="relative mb-5 border border-gray-200 rounded-xl overflow-hidden shadow-sm group">
                <div className="relative h-[400px] overflow-hidden bg-gray-100">
                    {allImages.map((image, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                                selectedImage === index
                                    ? 'opacity-100 translate-x-0 scale-100'
                                    : direction === 'next'
                                    ? index < selectedImage
                                        ? 'opacity-0 -translate-x-full scale-95'
                                        : 'opacity-0 translate-x-full scale-95'
                                    : index < selectedImage
                                        ? 'opacity-0 -translate-x-full scale-95'
                                        : 'opacity-0 translate-x-full scale-95'
                            }`}
                        >
                            <img
                                src={image}
                                alt={`${product.product_name} - Ảnh ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = '/images/placeholder.jpg' }}
                            />
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Auto Play Toggle */}
                        <button
                            onClick={() => setIsAutoPlay(!isAutoPlay)}
                            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                            aria-label={isAutoPlay ? 'Pause slideshow' : 'Play slideshow'}
                        >
                            {isAutoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                            {selectedImage + 1} / {allImages.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex gap-3 flex-wrap justify-center">
                {allImages.map((image, index) => (
                    <div
                        key={index}
                        className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
                            selectedImage === index
                                ? 'ring-2 ring-blue-600 ring-offset-2 scale-105'
                                : 'hover:ring-2 hover:ring-gray-300 hover:scale-105'
                        }`}
                        onClick={() => handleDotClick(index)}
                    >
                        <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-20 h-20 object-cover"
                            onError={(e) => { e.target.src = '/images/placeholder.jpg' }}
                        />
                        {selectedImage === index && (
                            <div className="absolute inset-0 bg-blue-600/20 border-2 border-blue-600" />
                        )}
                    </div>
                ))}
            </div>

            {/* Dot Indicators */}
            {allImages.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {allImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`transition-all duration-300 rounded-full ${
                                selectedImage === index
                                    ? 'w-8 h-2 bg-blue-600'
                                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
