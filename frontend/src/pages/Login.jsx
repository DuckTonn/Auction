import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login({ email, password });

    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  const handleGoogleLogin = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const state = "google"; // Đánh dấu đây là login google

    if (!googleClientId || googleClientId.includes('placeholder')) {
      alert("Note: You are using a placeholder Client ID.");
    }

    const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${encodeURIComponent(
      redirectUri
    )}&prompt=consent&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile&access_type=offline&state=${state}`;

    window.location.href = targetUrl;
  };

  const handleFacebookLogin = () => {
    const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
    const redirectUri = import.meta.env.VITE_FACEBOOK_REDIRECT_URI;
    const state = "facebook"; // Đánh dấu đây là login facebook

    if (!facebookAppId || facebookAppId.includes('placeholder')) {
      alert("Note: You are using a placeholder Client ID.");
    }

    const targetUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=email,public_profile`;

    window.location.href = targetUrl;
  };

  const handleGitHubLogin = () => {
    const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    const state = "github"; // Đánh dấu đây là login github

    if (!githubClientId || githubClientId.includes('placeholder')) {
      alert("Note: You are using a placeholder Client ID.");
    }

    // GitHub cần scope user:email để lấy email người dùng
    const targetUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${state}`;

    window.location.href = targetUrl;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-700">
      {/* Card Container - Responsive width */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        <h1 className="text-center mb-8 text-3xl font-bold text-slate-800 tracking-tight uppercase">
          Đăng Nhập
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={handleInputChange(setEmail)}
              required
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200
                ${error 
                  ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                  : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-slate-400'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
            />
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handleInputChange(setPassword)}
              required
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200
                ${error 
                  ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                  : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-slate-400'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-blue-600 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Đang xử lý...
              </span>
            ) : 'Đăng nhập'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500">Hoặc tiếp tục với</span>
          </div>
        </div>

        {/* Social Login Buttons Grid */}
        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 w-full py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-200 hover:border-slate-300 transition-all duration-200 font-medium text-sm cursor-pointer"
          >
            {/* Google Icon SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleFacebookLogin}
              className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-200 font-medium text-sm group cursor-pointer"
            >
              {/* Facebook Icon SVG */}
              <svg className="w-5 h-5 text-[#1877F2] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>

            <button 
              onClick={handleGitHubLogin}
              className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-[#24292F] hover:text-white hover:border-[#24292F] transition-all duration-200 font-medium text-sm group cursor-pointer"
            >
              {/* Github Icon SVG */}
              <svg className="w-5 h-5 text-[#24292F] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          Chưa có tài khoản?{' '}
          <Link 
            to="/signup" 
            className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            Đăng ký ngay
          </Link>
        </div>

      </div>
    </div>
  );
}