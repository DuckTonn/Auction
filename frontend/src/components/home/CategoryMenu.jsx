import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';

export default function CategoryMenu({ show, onHover, onClickCategory }) {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // 1. Fetch dữ liệu danh mục khi mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await categoryService.getAllCategories();
        if (res && res.data) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error("Lỗi menu:", error);
      }
    };
    fetchData();

    // Polling cứ 5 phút để cập nhật danh mục mới
    const intervalId = setInterval(fetchData, 5 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // 2. Xử lý phân loại cha/con
  const rootCategories = categories?.filter(c => !c.parent) || [];
  
  const getChildCategories = (parentId) => {
    return categories?.filter(c => c.parent && c.parent._id === parentId) || [];
  };

  const handleCategoryClick = (slug) => {
    navigate(`/category/${slug}`);
    if (onClickCategory) onClickCategory();
  };

  if (!show) return null;

  return (
    <div 
      className="absolute top-full left-0 w-[600px] z-50 pt-3"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="bg-white flex flex-wrap gap-8 p-6 rounded-xl shadow-2xl border border-gray-200">
        {rootCategories.map((rootCat) => {
          const subCats = getChildCategories(rootCat._id);
          return (
            <div key={rootCat._id} className="min-w-[200px] mb-2 flex-1">
              
              {/* Danh mục cha */}
              <h4 
                className="text-slate-700 font-bold border-b-2 border-blue-500 cursor-pointer mb-3 pb-1 hover:text-blue-600 transition-colors uppercase tracking-wide text-sm"
                onClick={() => handleCategoryClick(rootCat.slug)}
              >
                {rootCat.category_name}
              </h4>
              
              {/* Danh sách danh mục con */}
              <div className="flex flex-col gap-2">
                {subCats.map(sub => (
                  <span 
                    key={sub._id} 
                    className="cursor-pointer text-gray-500 text-sm hover:text-blue-600 hover:translate-x-1 transition-all duration-200 flex items-center"
                    onClick={() => handleCategoryClick(sub.slug)}
                  >
                    <span className="mr-1 text-xs opacity-50">•</span> {sub.category_name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}