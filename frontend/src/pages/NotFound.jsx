import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
    <div className="h-full flex-grow flex items-center justify-center bg-white px-4 py-12 relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-gray-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="mb-2">
            <h1 className="text-9xl md:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 drop-shadow-sm select-none">
                404
            </h1>
            </div>

            <div className="mb-10 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                Trang không tìm thấy
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto font-medium">
                Xin lỗi, chúng tôi không tìm thấy trang bạn đang tìm kiếm. Có thể đường dẫn đã bị sai hoặc trang đã bị xóa.
            </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
                to="/"
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-all duration-300 shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5"
            >
                ← Về trang chủ
            </Link>
            
            <button
                onClick={() => window.history.back()}
                className="w-full sm:w-auto px-8 py-3.5 border-2 border-gray-900 text-gray-900 font-bold rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-300 cursor-pointer"
            >
                Quay lại
            </button>
            </div>
        </div>
    </div>
  );
}