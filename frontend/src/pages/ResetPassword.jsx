// pages/ResetPassword.js
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

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

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (message) setMessage('');
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
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
              required
              maxLength={6}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg border text-lg font-bold tracking-[0.5em] text-center outline-none transition-all duration-200 placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400
                ${message && !message.includes('thành công')
                  ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                  : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                } disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu mới</label>
            <input
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={handleInputChange(setNewPassword)}
              required
              minLength={6}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200
                ${message && !message.includes('thành công')
                  ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                  : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                } disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword)}
              required
              minLength={6}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200
                ${message && !message.includes('thành công')
                  ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                  : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                } disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
            />
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
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-blue-600 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Đang xử lý...
              </span>
            ) : 'Cập nhật mật khẩu'}
          </button>
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