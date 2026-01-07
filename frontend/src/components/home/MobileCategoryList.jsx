import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';

export default function MobileCategoryList({ onSelectCategory }) {
  const [categories, setCategories] = useState([]);

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
  }, []);

  const rootCategories = categories?.filter(c => !c.parent) || [];
  
  const getChildCategories = (parentId) => {
    return categories?.filter(c => c.parent && c.parent._id === parentId) || [];
  };

  return (
    <div className="mt-2 bg-gray-800/50 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
      {rootCategories.map((rootCat) => {
        const subCats = getChildCategories(rootCat._id);
        return (
          <div key={rootCat._id} className="bg-gray-600 border-b border-gray-700 last:border-b-0">
            <button
              onClick={() => onSelectCategory(rootCat.slug)}
              className="w-full text-left px-4 py-3 text-white font-semibold items-center justify-between cursor-pointer flex"
            >
              <span>{rootCat.category_name}</span>
            </button>
            {subCats.length > 0 && (
              <div className="bg-gray-800/70">
                {subCats.map((subCat) => (
                  <button
                    key={subCat._id}
                    onClick={() => onSelectCategory(subCat.slug)}
                    className="w-full text-left px-6 py-2 text-sm text-gray-300 flex items-center cursor-pointer flex"
                  >
                    <span className="mr-2">→</span>
                    {subCat.category_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}