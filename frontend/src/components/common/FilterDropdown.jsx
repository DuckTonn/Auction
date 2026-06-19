import React, { useState } from 'react';

const FilterDropdown = ({ label, options, selectedValue, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Tìm nhãn hiển thị cho giá trị đang chọn
  // Fallback về option đầu tiên nếu không tìm thấy
  const currentLabel = options.find(opt => opt.value === selectedValue)?.label || options[0]?.label || "Chọn";

  return (
    <div className="relative inline-block text-left w-full sm:w-auto font-sans z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full sm:w-56 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
      >
        <span className="truncate flex items-center">
          <span className="text-gray-500 mr-2 text-sm font-medium">{label}:</span>
          <span className="font-bold text-gray-800 text-sm">{currentLabel}</span>
        </span>
        
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" height="16" viewBox="0 0 24 24" 
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
            className={`ml-2 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
            <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <>
            <div className="absolute right-0 sm:left-0 z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            <ul className="py-1">
                {options.map((option) => (
                <li
                    key={option.value}
                    onClick={() => {
                        onSelect(option.value);
                        setIsOpen(false);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                        selectedValue === option.value 
                            ? "bg-blue-50 text-blue-600 font-bold" 
                            : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    {option.label}
                </li>
                ))}
            </ul>
            </div>
            
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
        </>
      )}
    </div>
  );
};

export default FilterDropdown;