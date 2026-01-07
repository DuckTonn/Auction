// pages/ResetPassword.js
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Button from '../components/common/Button';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [])

  const validate = () => {
    const newErrors = {};
    if (!otp.trim()) newErrors.otp = 'Mã OTP là bắt buộc';
    else if (!/^[0-9]{6}$/.test(otp)) newErrors.otp = 'Mã OTP phải là 6 số';
    if (!newPassword.trim()) newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    else if (newPassword.length < 6) newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMessage('');

    const result = await authService.resetPassword(email, otp, newPassword);
    
    if (result.success) {
      setMessage(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    setErrors(prev => ({ ...prev, [field]: '' }));
    if (message) setMessage('');
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setErrors(prev => ({ ...prev, otp: '' }));
    if (message) setMessage('');
  };

  if (!email) {
    return (
      <div className="bg-[#c7dbe6] min-h-screen flex justify-center py-[60px] font-sans text-[#153243]">
        <div className="w-[420px]">
          <div className="text-[#c62828] text-[13px] mt-1 mb-2 text-center">Email không hợp lệ</div>
          <div className="mt-[15px] text-center text-[14px]">
            <Link 
              to="/forgot-password" 
              className="font-semibold text-[#284b63] underline hover:text-[#1e3a4f]"
            >
              ← Quay lại quên mật khẩu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-700">
      {/* Card Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        <h1 className="text-center mb-6 text-2xl font-bold text-slate-800 tracking-tight uppercase">
          Đặt lại mật khẩu
        </h1>

        {/* Context Info Box */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <div className="text-sm text-blue-900">
                <p className="opacity-80 mb-1">Mã OTP xác thực đã được gửi đến:</p>
                <p className="font-bold text-blue-700 break-all">{email}</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* OTP Input - Styled specifically for codes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã OTP (6 số)</label>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={handleOtpChange}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg border text-lg font-bold tracking-[0.5em] text-center outline-none transition-all duration-200 placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400
                ${errors.otp || (message && !message.includes('thành công'))
                  ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                  : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                } disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
            />
            {errors.otp && <p className="text-red-600 text-sm mt-1">{errors.otp}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu mới</label>
            <input
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={handleInputChange(setNewPassword, 'newPassword')}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200
                ${errors.newPassword || (message && !message.includes('thành công'))
                  ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                  : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                } disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
            />
            {errors.newPassword && <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword, 'confirmPassword')}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200
                ${errors.confirmPassword || (message && !message.includes('thành công'))
                  ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                  : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                } disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
            />
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`flex items-start gap-3 p-3 rounded-lg text-sm border 
              ${message.includes('thành công') 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {message.includes('thành công') ? (
                  <svg className="w-5 h-5 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                  <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              <span className="mt-0.5">{message}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            loading={loading}
            className="uppercase tracking-wide shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
          >
            Cập nhật mật khẩu
          </Button>
        </form>

        {/* Back Navigation */}
        <div className="mt-8 text-center">
          <Link 
            to="/forgot-password" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Quay lại
          </Link>
        </div>

      </div>
    </div>
  );
}