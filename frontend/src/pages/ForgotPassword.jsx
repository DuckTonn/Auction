// pages/ForgotPassword.js
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Button from '../components/common/Button';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [])

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email không hợp lệ';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMessage('');

    const result = await authService.forgotPassword(email);
    
    if (result.success) {
      setMessage(result.message);
      setEmailSent(true);
      console.log('✅ Kiểm tra OTP trong terminal backend');
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-700">
      {/* Card Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        <h1 className="text-center mb-2 text-2xl font-bold text-slate-800 tracking-tight uppercase">
          Quên mật khẩu?
        </h1>
        
        <p className="text-center text-slate-500 text-sm mb-8">
          Vui lòng nhập email của bạn.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email liên kết</label>
            <div className="relative">
                <input
                type="text"
                placeholder="name@example.com"
                value={email}
                onChange={handleInputChange(setEmail, 'email')}
                disabled={loading || emailSent}
                className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200
                    ${errors.email || (message && !message.includes('gửi'))
                    ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                    : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    } disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
                />
                {/* Mail Icon optional */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Message Alert (Success/Error) */}
          {message && (
            <div className={`flex items-start gap-3 p-3 rounded-lg text-sm border 
              ${message.includes('gửi') 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {message.includes('gửi') ? (
                  <svg className="w-5 h-5 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                  <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              <span className="mt-0.5">{message}</span>
            </div>
          )}

          {/* Main Action Button */}
          {!emailSent ? (
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              loading={loading}
              className="uppercase tracking-wide shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
            >
              Gửi mã xác thực
            </Button>
          ) : (
            /* Navigate Button - Only shows when Email Sent */
            <div className="space-y-4">
                <Button
                    type="button"
                    variant="success"
                    size="lg"
                    fullWidth
                    onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                    className="uppercase tracking-wide shadow-lg shadow-green-500/30 hover:shadow-green-500/40"
                >
                    Nhập OTP & Mật khẩu mới
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Button>
                <p className="text-center text-xs text-slate-400">
                    Chưa nhận được mail? <button type="submit" disabled={loading} className="text-blue-600 hover:underline font-medium disabled:opacity-50 cursor-pointer">Gửi lại</button>
                </p>
            </div>
          )}

        </form>

        {/* Back to Login Link */}
        <div className="mt-8 text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Quay lại đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
}