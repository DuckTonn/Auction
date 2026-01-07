const OrderTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'info', label: 'Thông tin đơn hàng' },
        { id: 'payment', label: 'Thanh toán' },
        { id: 'shipping', label: 'Vận chuyển' },
        { id: 'rating', label: 'Đánh giá' }
    ];

    return (
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <nav className="flex">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-4 px-6 font-medium text-sm cursor-pointer transition-all duration-200 relative ${
                            activeTab === tab.id
                                ? 'text-blue-600 bg-gradient-to-b from-blue-50 to-transparent'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span>{tab.label}</span>
                        </div>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-lg"></div>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default OrderTabs;
