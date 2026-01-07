import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

export default function LoginRequestModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
         
         <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
             <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
           </svg>
         </div>

         <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
           Yêu cầu đăng nhập
         </h3>
         
         <p className="text-gray-500 text-sm text-center mb-6">
           Vui lòng đăng nhập để thực hiện chức năng này.
         </p>

         <div className="flex gap-3">
           <button
             onClick={onClose}
             className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm cursor-pointer"
           >
             Đóng
           </button>

           <button
             onClick={() => navigate('/login')}
             className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm cursor-pointer"
           >
             Đăng nhập
           </button>
         </div>
      </div>
    </div>,
    document.body
  );
}