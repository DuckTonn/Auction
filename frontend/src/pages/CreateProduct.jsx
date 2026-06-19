import { useState, useEffect, useRef } from 'react';
import { data, useNavigate } from 'react-router-dom';
import { productService } from '../services/product.service';
import { categoryService } from '../services/categoryService';
import ToastNotification from '../components/common/ToastNotification';
import TextEditor from '../components/common/TextEditor';
import ConfirmDialog from '../components/common/ConfirmDialog';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const thumbnailInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const [categories, setCategories] = useState([]); 
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
  const [isDraggingImages, setIsDraggingImages] = useState(false);

  const initialFormState = {
    name: '',
    category: '',
    start_price: '',
    step_price: '',
    buy_now_price: '',
    description: '',
    auction_end: '',
    auto_renew: false,
    allow_newbie: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await categoryService.getAllCategories();
        
        let categoriesArray = [];
        if (Array.isArray(data)) {
            categoriesArray = data;
        } else if (data.data && Array.isArray(data.data)) {
            categoriesArray = data.data;
        } else if (data.categories && Array.isArray(data.categories)) {
            categoriesArray = data.categories;
        } else {
            categoriesArray = [];
        }

        setCategories(categoriesArray);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
        ToastNotification('Không thể tải danh mục!', 'error');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      imagesPreview.forEach(preview => URL.revokeObjectURL(preview));
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [thumbnailPreview, imagesPreview]);

  const showToastWithDelay = (message, type) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      ToastNotification(message, type);
    }, 500);
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Compute the new form data as it will be after this change
    const newFormData = { ...formData, [name]: type === 'checkbox' ? checked : value };
    if (newFormData.start_price && newFormData.step_price) {
      if (Number(newFormData.step_price) >= Number(newFormData.start_price)) {
        showToastWithDelay("⚠️ Khuyến nghị: Bước giá nên nhỏ hơn giá khởi điểm!", "warning");
      }
      if (Number(newFormData.start_price) <= Number(newFormData.step_price)) {
        showToastWithDelay("⚠️ Khuyến nghị: Giá khởi điểm nên lớn hơn bước giá!", "warning");
      }
    }
  };

  const handleDescriptionChange = (content) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }));
  };

  const handleThumbnailProcess = (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      ToastNotification('Chỉ chấp nhận file ảnh (JPG, JPEG, PNG, WEBP)!', 'error');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      ToastNotification('Ảnh đại diện không được vượt quá 5MB!', 'error');
      return;
    }

    setThumbnail(file);
    const preview = URL.createObjectURL(file);
    setThumbnailPreview(preview);
  };

  const onThumbnailChange = (e) => handleThumbnailProcess(e.target.files[0]);
  
  const onThumbnailDrop = (e) => {
    e.preventDefault();
    setIsDraggingThumbnail(false);
    const file = e.dataTransfer.files[0];
    handleThumbnailProcess(file);
  };

  const handleImagesProcess = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;
    const maxFiles = 10;

    if (images.length + fileList.length > maxFiles) {
      ToastNotification(`Chỉ được upload tối đa ${maxFiles} ảnh chi tiết!`, 'error');
      return;
    }

    const validFiles = [];
    const previews = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      if (!allowedTypes.includes(file.type)) {
        ToastNotification(`File "${file.name}" không phải là ảnh hợp lệ!`, 'error');
        continue;
      }

      if (file.size > maxSize) {
        ToastNotification(`File "${file.name}" vượt quá 5MB!`, 'error');
        continue;
      }

      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
      setImagesPreview(prev => [...prev, ...previews]);
    }
  };

  const onImagesChange = (e) => handleImagesProcess(e.target.files);

  const onImagesDrop = (e) => {
    e.preventDefault();
    setIsDraggingImages(false);
    handleImagesProcess(e.dataTransfer.files);
  };

  const removeThumbnail = (e) => {
    e.stopPropagation();
    setThumbnail(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const removeImage = (index, e) => {
    e.stopPropagation();
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e, setDragState) => {
    e.preventDefault();
    setDragState(true);
  };

  const handleDragLeave = (e, setDragState) => {
    e.preventDefault();
    setDragState(false);
  };
  
  const formatPrice = (price) => {
    if (price === undefined || price === null || price === '' || isNaN(Number(price)) || !isFinite(Number(price))) {
      return 'N/A';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));
  };

  const getConfirmMessage = () => {
    let parts = [];
    parts.push(`${formData.name}`);
    parts.push(`Giá khởi điểm: ${formatPrice(formData.start_price)}`);
    parts.push(`Bước giá: ${formatPrice(formData.step_price)}`);
    parts.push(`Danh mục: ${categories.find(cat => (cat._id || cat.id) === formData.category)?.category_name || 'N/A'}`);
    parts.push(`Thời gian kết thúc: ${new Date(formData.auction_end).toLocaleString('vi-VN')}`);
    if (formData.buy_now_price && Number(formData.buy_now_price) > 0) {
      parts.push(`Giá mua ngay: ${formatPrice(formData.buy_now_price)}`);
    }
    parts.push(`Tự động gia hạn: ${formData.auto_renew ? 'Có' : 'Không'}`);
    parts.push(`Cho phép người mới tham gia: ${formData.allow_newbie ? 'Có' : 'Không'}`);
    
    return parts.map((line, idx) => (
      <span key={idx}>{line}<br /></span>
    ));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!thumbnail) return ToastNotification("Vui lòng chọn ảnh đại diện!", "error");
    if (!formData.category) return ToastNotification("Vui lòng chọn danh mục!", "error");
    if (!formData.step_price || Number(formData.step_price) <= 0) {
        return ToastNotification("Vui lòng nhập bước giá hợp lệ!", "error");
    }
    
    if (formData.buy_now_price && Number(formData.buy_now_price) > 0 && Number(formData.buy_now_price) <= Number(formData.start_price)) {
      return ToastNotification("Giá mua ngay phải lớn hơn giá khởi điểm!", "error");
    }

    if (images.length < 3) {
      return ToastNotification("Vui lòng chọn ít nhất 3 ảnh chi tiết!", "error");
    }
    const auctionEndTime = new Date(formData.auction_end);
    const now = new Date();
    
    if (auctionEndTime <= now) {
      return ToastNotification("Thời gian kết thúc phải lớn hơn thời gian hiện tại!", "error");
    }

    // Hiển thị confirm dialog
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setIsLoading(true);

    try {
      const dataToSend = new FormData();

      dataToSend.append('product_name', formData.name);
      dataToSend.append('category', formData.category);
      dataToSend.append('description', formData.description);
      dataToSend.append('start_price', formData.start_price);
      dataToSend.append('bid_increment', formData.step_price);
      
      if (formData.buy_now_price) {
        dataToSend.append('buy_it_now_price', formData.buy_now_price);
      }
      
      if (formData.auction_end) {
        dataToSend.append('auction_end_time', formData.auction_end);
      }

      dataToSend.append('auto_renew', formData.auto_renew);
      dataToSend.append('allow_newbie', formData.allow_newbie);

      if (!(thumbnail instanceof File)) {
        throw new Error("Thumbnail không hợp lệ");
      }
      dataToSend.append('thumbnail', thumbnail);

      let validImageCount = 0;
      for (let i = 0; i < images.length; i++) {
        if (images[i] instanceof File) {
          dataToSend.append('images', images[i]);
          validImageCount++;
        }
      }

      if (validImageCount === 0) {
        throw new Error("Không có ảnh chi tiết hợp lệ");
      }

      await productService.createProduct(dataToSend);
      
      ToastNotification("Tạo sản phẩm thành công!", "success");
      setFormData(initialFormState);

      setThumbnail(null);
      setThumbnailPreview(null);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';

      setImages([]);
      setImagesPreview([]);
      if (imagesInputRef.current) imagesInputRef.current.value = '';

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error("Lỗi Submit:", error);
      const msg = error.response?.data?.message || 
                  error.response?.data?.error || 
                  error.message ||
                  "Có lỗi xảy ra khi tạo sản phẩm.";
      ToastNotification(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Tạo sản phẩm đấu giá mới
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={isLoadingCategories}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">
                  {isLoadingCategories ? 'Đang tải danh mục...' : 'Chọn danh mục'}
                </option>
                {categories.length > 0 && categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.category_name || cat.name || cat.title || "Danh mục"}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá khởi điểm <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="start_price"
                  value={formData.start_price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VNĐ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bước giá <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="step_price"
                  value={formData.step_price}
                  onChange={handleChange}
                  required
                  min="1000"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VNĐ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá mua ngay
                </label>
                <input
                  type="number"
                  name="buy_now_price"
                  value={formData.buy_now_price}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VNĐ (Không bắt buộc)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="auction_end"
                value={formData.auction_end}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">
                    Tự động gia hạn đấu giá
                  </span>
                  <p className="mt-1 text-xs text-gray-500">
                    Đấu giá sẽ được tự động gia hạn nếu có người đấu giá trong phút cuối
                  </p>
                </div>
                <div className="relative ml-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    name="auto_renew"
                    checked={formData.auto_renew}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-7 h-7 border-2 border-gray-300 rounded-md peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 peer-focus:ring-offset-2 transition-all duration-200 flex items-center justify-center bg-white peer">
                    {formData.auto_renew && (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả sản phẩm <span className="text-red-500">*</span>
              </label>
              <TextEditor
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh đại diện <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                onDrop={onThumbnailDrop}
                onDragOver={(e) => handleDragOver(e, setIsDraggingThumbnail)}
                onDragLeave={(e) => handleDragLeave(e, setIsDraggingThumbnail)}
                className={`
                  relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                  transition-all duration-200
                  ${isDraggingThumbnail 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }
                  ${thumbnailPreview ? 'h-64' : 'h-48'}
                `}
              >
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={onThumbnailChange}
                  className="hidden"
                />
                
                {thumbnailPreview ? (
                  <div className="relative h-full group">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-full w-full object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-700 text-3xl font-bold leading-none"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 font-medium mb-1">
                      Kéo thả ảnh vào đây hoặc nhấn để chọn
                    </p>
                    <p className="text-gray-400 text-sm">
                      JPG, PNG, WEBP (Tối đa 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh chi tiết <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-2">(Tối đa 10 ảnh)</span>
              </label>
              <div
                onClick={() => imagesInputRef.current?.click()}
                onDrop={onImagesDrop}
                onDragOver={(e) => handleDragOver(e, setIsDraggingImages)}
                onDragLeave={(e) => handleDragLeave(e, setIsDraggingImages)}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                  transition-all duration-200
                  ${isDraggingImages 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  ref={imagesInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={onImagesChange}
                  className="hidden"
                />
                
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 font-medium mb-1">
                    Kéo thả nhiều ảnh vào đây hoặc nhấn để chọn
                  </p>
                  <p className="text-gray-400 text-sm">
                    JPG, PNG, WEBP (Tối đa 5MB mỗi ảnh)
                  </p>
                </div>
              </div>

              {imagesPreview.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {imagesPreview.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={(e) => removeImage(index, e)}
                        className="cursor-pointer absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-700 text-2xl font-bold leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">
                    Cho phép người dùng mới đấu giá
                  </span>
                  <p className="mt-1 text-xs text-gray-500">
                    Người chưa có lượt đánh giá vẫn có thể tham gia đấu giá sản phẩm này
                  </p>
                </div>
                <div className="relative ml-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    name="allow_newbie"
                    checked={formData.allow_newbie}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-7 h-7 border-2 border-gray-300 rounded-md peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 peer-focus:ring-offset-2 transition-all duration-200 flex items-center justify-center bg-white peer">
                    {formData.allow_newbie && (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? 'Đang tạo...' : 'Tạo sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {showConfirm && (
        <ConfirmDialog
          message={getConfirmMessage()}
          onYes={handleConfirmSubmit}
          onNo={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default CreateProduct;