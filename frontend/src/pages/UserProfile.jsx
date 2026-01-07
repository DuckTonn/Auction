import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

import ToastNotification from '../components/common/ToastNotification.jsx'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '../components/common/Button';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [ratingStats, setRatingStats] = useState({ percent: 0, count: 0 });

  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmailUpdate, setPendingEmailUpdate] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    email: '',
    date_of_birth: ''
  });

  const [errors, setErrors] = useState({
    full_name: '',
    phone_number: '',
    email: ''
  });

  const [passErrors, setPassErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const validatePhone = (phone) => {
    const regex = /^\d{9,15}$/;
    return regex.test(phone);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

 useEffect(() => {
    const fetchProfile = async () => {
      try {
        const rawData = await authService.getProfile();
        let finalUser = rawData.data || rawData.user || rawData.result || rawData;

        if (finalUser) {
          setUser(finalUser);
          
          if (!isEditing) {
              setFormData({
                full_name: finalUser.full_name || '',
                phone_number: finalUser.phone_number || '',
                address: finalUser.address || '',
                email: finalUser.email || '',
                date_of_birth: finalUser.date_of_birth ? new Date(finalUser.date_of_birth).toISOString().split('T')[0] : ''
              });
          } 

          const count = finalUser.rating_count || 0; 
          const score = finalUser.rating_score || 0;

          if (count > 0) {
            let ratio = ((count + score) / 2 / count) * 100;
            ratio = Math.min(Math.max(ratio, 0), 100);
            
            setRatingStats({
              percent: ratio.toFixed(1),
              count: count
            });
          } else {
            setRatingStats({ percent: 0, count: 0 });
          }
        }
      } catch (error) {
        console.error("Lỗi tải profile:", error);
        ToastNotification("Không thể tải thông tin người dùng", "error");
      } 
    };

    fetchProfile();

    const intervalId = setInterval(fetchProfile, 30000);

    return () => clearInterval(intervalId);

  }, [isEditing]);

  const handleCloseModal = () => {
    setShowPassModal(false);
    setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPassErrors({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleChangeInfo = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      full_name: '',
      phone_number: '',
      email: ''
    };
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Họ tên không được để trống';
    }
    
    if (formData.phone_number && !validatePhone(formData.phone_number)) {
      newErrors.phone_number = 'Số điện thoại không hợp lệ (chỉ chứa số, 9-15 ký tự)';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }
    
    setErrors(newErrors);
    
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    if (hasErrors) {
      return;
    }

    const isEmailChanged = formData.email !== user.email;

    if (isEmailChanged) {
      setLoading(true);
      const res = await profileService.sendEmailUpdateOtp(formData.email);
      setLoading(false);

      if (res.success) {
        setPendingEmailUpdate(formData);
        setOtpCode('');
        setShowOtpModal(true);     
        ToastNotification(res.message, "info");
      } else {
        ToastNotification(res.message, "error");
      }
    } else {
      await executeUpdate(formData);
    }
  };

  const executeUpdate = async (dataToUpdate) => {
    setLoading(true);
    const res = await profileService.updateProfile(dataToUpdate);
    setLoading(false);

    if (res.success) {
      setUser(prev => ({ ...prev, ...dataToUpdate }));
      setIsEditing(false);
      setShowOtpModal(false);
      setPendingEmailUpdate(null);
      setErrors({ full_name: '', phone_number: '', email: '' });
      ToastNotification("Cập nhật thông tin thành công!", "success");
    } else {
      ToastNotification(res.message, "error");
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      return ToastNotification("Vui lòng nhập mã OTP đầy đủ", "warning");
    }
    const finalPayload = {
      ...pendingEmailUpdate,
      otp: cleanOtp 
    };
    await executeUpdate(finalPayload);
  };

  const handleChangePass = async (e) => {
    e.preventDefault();
  
    const newPassErrors = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    if (!passData.oldPassword) {
      newPassErrors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    }
    
    if (!passData.newPassword) {
      newPassErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    }
    
    if (!passData.confirmPassword) {
      newPassErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    }
    
    if (passData.newPassword !== passData.confirmPassword) {
      newPassErrors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
    }
    
    if (passData.oldPassword === passData.newPassword) {
      newPassErrors.newPassword = 'Mật khẩu mới không được trùng mật khẩu cũ!';
    }
    
    setPassErrors(newPassErrors);

    const hasErrors = Object.values(newPassErrors).some(error => error !== '');
    
    if (hasErrors) {
      return;
    }
    
    const res = await profileService.changePassword(passData.oldPassword, passData.newPassword);
    
    if (res.success) {
      ToastNotification("Đổi mật khẩu thành công!", "success");
      handleCloseModal();
    } else {
      ToastNotification(res.message, "error");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      full_name: user.full_name || '',
      phone_number: user.phone_number || '',
      address: user.address || '',
      email: user.email || '',
      date_of_birth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : ''
    });
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-500 animate-pulse">Đang tải dữ liệu...</div>
    </div>
  );

  const isAdmin = user.role === 'admin';
  const hasLocalProvider = user.providers.some(p => p.provider === 'local');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <ToastContainer />

      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${formData.full_name}&background=random&color=fff`} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
              />
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{formData.full_name}</h1>
              <p className="text-gray-500 mb-3">{user.email}</p>
              <div className="flex gap-2 justify-center md:justify-start">
                <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">{user.role || 'MEMBER'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
             {!isEditing && (
               <>
                {hasLocalProvider && (
                  <button onClick={() => setShowPassModal(true)} className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                    Đổi mật khẩu
                  </button>
                )}
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                  Chỉnh sửa hồ sơ
                </button>
               </>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Thông tin cá nhân</h2>
                {isEditing && <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">Đang chỉnh sửa</span>}
            </div>
            
            <form onSubmit={handleSaveInfo} className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500 mb-1">Email {isEditing && <span className='text-xs text-red-500'>(Cần xác thực OTP nếu đổi)</span>}</p>
                  {isEditing ? (
                    <>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChangeInfo} 
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none transition-all ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`} 
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </>
                  ) : <p className="font-medium text-gray-900 py-1">{user.email}</p>}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500 mb-1">Họ tên</p>
                  {isEditing ? (
                    <>
                      <input 
                        type="text" 
                        name="full_name" 
                        value={formData.full_name} 
                        onChange={handleChangeInfo} 
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none transition-all ${
                          errors.full_name ? 'border-red-500' : 'border-gray-300'
                        }`} 
                      />
                      {errors.full_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                      )}
                    </>
                  ) : <p className="font-medium text-gray-900 py-1">{formData.full_name || "Chưa cập nhật"}</p>}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                  {isEditing ? (
                    <>
                      <input 
                        type="text" 
                        name="phone_number" 
                        value={formData.phone_number} 
                        onChange={handleChangeInfo} 
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none transition-all ${
                          errors.phone_number ? 'border-red-500' : 'border-gray-300'
                        }`} 
                      />
                      {errors.phone_number && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                      )}
                    </>
                  ) : <p className="font-medium text-gray-900 py-1">{formData.phone_number || "Chưa cập nhật"}</p>}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                  {isEditing ? (
                    <input type="text" name="address" value={formData.address} onChange={handleChangeInfo} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
                  ) : <p className="font-medium text-gray-900 py-1">{formData.address || "Chưa cập nhật"}</p>}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500 mb-1">Ngày sinh</p>
                  {isEditing ? (
                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChangeInfo} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
                  ) : <p className="font-medium text-gray-900 py-1">{formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</p>}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="submit"
                    variant="success"
                    size="md"
                    disabled={loading}
                    loading={loading}
                    className="flex-1"
                  >
                    Lưu thay đổi
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </div>
              )}
            </form>
          </div>

          {isAdmin ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-6">Quyền Quản Trị Viên</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                     <div className="flex items-center gap-3 mb-3">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                       <span className="text-base font-bold text-red-900">ADMIN</span>
                     </div>
                     <p className="text-sm text-gray-700">Quyền toàn quyền quản lý hệ thống</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                     <h3 className="font-semibold text-gray-900 mb-3">Quyền truy cập</h3>
                     <ul className="space-y-2">
                       <li className="flex items-center gap-2 text-sm text-gray-700">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                         Quản lý người dùng
                       </li>
                       <li className="flex items-center gap-2 text-sm text-gray-700">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                         Quản lý sản phẩm & đấu giá
                       </li>
                       <li className="flex items-center gap-2 text-sm text-gray-700">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                         Quản lý danh mục
                       </li>
                     </ul>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                     <div className="flex items-center gap-2 mb-2">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                       <span className="text-sm text-blue-700 font-medium">Ngày tham gia</span>
                     </div>
                     <p className="font-bold text-blue-900 pl-6">
                       {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
                     </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Lưu ý bảo mật</p>
                    <p className="text-xs text-gray-600">Vui lòng bảo mật thông tin đăng nhập và không chia sẻ cho người khác</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Đánh giá & Phản hồi</h2>
                  <button 
                    onClick={() => navigate('/profile/ratings')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Xem tất cả
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
                
                {ratingStats.count > 0 ? (
                  <>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">{ratingStats.percent}%</span>
                      <span className="text-gray-500 text-sm ml-2">tích cực</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                      <div className="bg-black h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${ratingStats.percent}%` }}></div>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <span className="font-medium text-gray-700">Đánh giá uy tín</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">Dựa trên {ratingStats.count} lượt đánh giá</p>
                  </>
                ) : (
                  <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200 mb-6">
                    <p className="text-gray-500">Chưa có đánh giá nào.</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                 <div className="flex items-center gap-2 mb-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                   <span className="text-sm text-gray-500">Ngày tham gia</span>
                 </div>
                 <p className="font-medium text-gray-900 pl-6">
                   {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
                 </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-green-100 rounded-xl border border-green-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <h3 className="text-lg font-bold text-gray-900">Thông tin tài khoản</h3>
          </div>
          <div className="flex items-start gap-4 pl-1">
             <div className="mt-1 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
             </div>
             <div>
               <p className="text-sm text-gray-500 mb-1">Trạng thái hoạt động</p>
               <p className="font-medium text-gray-900">{user.is_deleted ? 'Đã khóa' : 'Đang hoạt động'}</p>
             </div>
          </div>
          {user.seller_expiry_date && (
            <div className="flex items-start gap-4 pl-1 mt-4">
               <div className="mt-1 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
               </div>
               <div>
                 <p className="text-sm text-gray-500 mb-1">Hạn quyền Seller</p>
                 <p className="font-medium text-green-700">{new Date(user.seller_expiry_date).toLocaleDateString('vi-VN')}</p>
               </div>
            </div>
          )}
        </div>

      </div>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-2">Xác thực Email</h3>
              <p className="text-sm text-gray-500 mb-4">Mã OTP đã được gửi tới <b>{formData.email}</b>.</p>
              
              <input 
                type="text" 
                placeholder="Nhập mã OTP" 
                value={otpCode}
                maxLength={6}
                inputMode="numeric"
                onChange={(e) => {
                const val = e.target.value;
                  if (/^\d*$/.test(val) && val.length <= 6) {
                    setOtpCode(val);
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg text-center text-lg tracking-widest font-bold mb-4 focus:border-black outline-none"
              />
              
              <div className="flex gap-3">
                 <Button
                   variant="outline"
                   size="md"
                   onClick={() => setShowOtpModal(false)}
                   className="flex-1"
                 >
                   Hủy
                 </Button>
                 <Button
                   variant="black"
                   size="md"
                   onClick={handleVerifyOtp}
                   disabled={loading}
                   loading={loading}
                   className="flex-1"
                 >
                   Xác nhận
                 </Button>
              </div>
           </div>
        </div>
      )}

      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={handleCloseModal}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h3>
               <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>
            </div>

            <form onSubmit={handleChangePass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu cũ</label>
                <input 
                  type="password" 
                  className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-black outline-none ${
                    passErrors.oldPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={passData.oldPassword} 
                  onChange={e => {
                    setPassData({...passData, oldPassword: e.target.value});
                    if (passErrors.oldPassword) setPassErrors(prev => ({...prev, oldPassword: ''}));
                  }} 
                />
                {passErrors.oldPassword && (
                  <p className="mt-1 text-sm text-red-600">{passErrors.oldPassword}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input 
                  type="password" 
                  className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-black outline-none ${
                    passErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={passData.newPassword} 
                  onChange={e => {
                    setPassData({...passData, newPassword: e.target.value});
                    if (passErrors.newPassword) setPassErrors(prev => ({...prev, newPassword: ''}));
                  }} 
                />
                {passErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passErrors.newPassword}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-black outline-none ${
                    passErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={passData.confirmPassword} 
                  onChange={e => {
                    setPassData({...passData, confirmPassword: e.target.value});
                    if (passErrors.confirmPassword) setPassErrors(prev => ({...prev, confirmPassword: ''}));
                  }} 
                />
                {passErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passErrors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleCloseModal}
                >
                  Đóng
                </Button>
                <Button
                  type="submit"
                  variant="black"
                  size="md"
                >
                  Xác nhận
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;