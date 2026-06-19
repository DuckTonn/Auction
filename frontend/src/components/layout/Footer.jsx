import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <div className="bg-gray-900 text-white py-10 px-5 mt-[60px]">
      <p className="text-center text-gray-400">
        © 2025 AuctionHub — Sản phẩm thuộc đồ án cuối kì.
      </p>
      <p className="text-center text-gray-500 mt-1 text-sm">
        Trang web chỉ phục vụ cho đồ án cuối kì môn Lập trình Ứng dụng Web.
      </p>
    </div>
  );
}