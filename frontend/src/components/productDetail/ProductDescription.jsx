import { useState } from 'react'
import { productService } from '../../services/product.service'
import ToastNotification from '../common/ToastNotification'
import TextEditor from '../common/TextEditor'
import Button from '../common/Button'
import 'react-quill-new/dist/quill.snow.css'

export default function ProductDescription({ product, isRealSeller, onRefresh }) {
    const [isEditing, setIsEditing] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Xử lý dữ liệu history
    const history = product.description_history || [];
    const sortedHistory = [...history].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
        });
    };

    const handleSubmit = async () => {
        if (!newContent || newContent === '<p><br></p>') {
            ToastNotification('Vui lòng nhập nội dung!', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await productService.appendDescription(product._id, newContent); 
            ToastNotification('Cập nhật mô tả thành công!', 'success');

            // Clear
            if (onRefresh) {
                await onRefresh(); 
            }
            setNewContent('');
            setIsEditing(false);
        } catch (error) {
            const message = error?.response?.data?.message || "Có lỗi xảy ra!";
            ToastNotification(message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mb-12">
        {/* HEADER & BUTTON */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-blue-600 pb-2">
            <h2 className="text-2xl font-bold text-gray-800">
            📝 Chi tiết & Cập nhật mô tả
            </h2>
            
            {product.auction_status === 'active' && isRealSeller && !isEditing && (
            <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Bổ sung thông tin
            </Button>
            )}
        </div>

        {/* FORM EDITOR */}
        {isEditing && (
            <div className="mb-8 animate-fade-in-down">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Thêm thông tin bổ sung</h3>
                <div className="mb-4 border border-gray-300 rounded-lg bg-white">
                <TextEditor 
                    value={newContent} 
                    onChange={setNewContent}
                    placeholder="Nhập thông tin bổ sung..."
                />
                </div>
                <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setIsEditing(false); setNewContent(''); }}
                    disabled={isSaving}
                >
                    Hủy bỏ
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmit}
                    disabled={isSaving}
                    loading={isSaving}
                    className="shadow-md"
                >
                    Lưu bổ sung
                </Button>
                </div>
            </div>
            </div>
        )}

        {/* LIST DESCRIPTION */}
        <div className="flex flex-col border border-gray-300 rounded-sm bg-white shadow-sm">
            {sortedHistory.length > 0 ? (
            sortedHistory.map((item, index) => (
                <div 
                key={index} 
                className={`group ${index !== sortedHistory.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                {/* Header */}
                <div className={`px-5 py-3 flex justify-between items-center ${index === 0 ? 'bg-blue-100/50' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2">
                    {index === 0 && (
                        <span className="bg-blue-600 text-white text-sm uppercase font-bold px-2 py-0.5 rounded-sm tracking-wide">
                        Mới nhất
                        </span>
                    )}
                    <span className={`text-sm font-medium ${index === 0 ? 'text-blue-800' : 'text-gray-600'}`}>
                        {index === 0 ? 'Nội dung hiện tại' : 'Lịch sử cập nhật'}
                    </span>
                    </div>
                    <span className="text-sm text-gray-500 font-mono">
                    {formatDate(item.timestamp)}
                    </span>
                </div>

                {/* Content */}
                <div className="p-6 bg-white">
                    <div 
                    className="prose prose-sm max-w-none text-[#111827] text-base leading-relaxed prose-headings:font-semibold prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-img:rounded-sm"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                </div>
                </div>
            ))
            ) : (
            <div className="p-8 text-center bg-gray-50">
                <p className="text-gray-500 text-sm">Người bán chưa cung cấp mô tả chi tiết cho sản phẩm này.</p>
            </div>
            )}
        </div>
        </div>
    );
}
