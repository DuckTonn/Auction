import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { setAuthToken } from '../services/api'
import ToastNotification from '../components/common/ToastNotification'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, setUser } = useAuth()
  const processedRef = useRef(false)

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Lấy state để phân biệt

    if (code && !processedRef.current) {
      processedRef.current = true;

      const handleCallback = async () => {
        try {
          let data;
          
          // Kiểm tra xem là Facebook hay Google
          if (state === 'facebook') {
             console.log("Đang đăng nhập Facebook...");
             data = await authService.loginWithFacebook(code);
          } else if (state === 'google') {
             console.log("Đang đăng nhập Google...");
             data = await authService.loginWithGoogle(code);
          } else if (state === 'github') {
             console.log("Đang đăng nhập GitHub...");
             data = await authService.loginWithGitHub(code);
          } else {
             // Nếu state không rõ, cố gắng mặc định fallback gọi google
             console.log("Đang đăng nhập từ nhà cung cấp không xác định (không có state).");
             data = await authService.loginWithGoogle(code);
          }

          // Đoạn dưới giữ nguyên (Lưu token, lấy profile, redirect)
          const rawToken = data.accessToken.replace('Bearer ', '');
          setAuthToken(rawToken);
          const profileRes = await authService.getProfile();
          setUser(profileRes.user);
          if (profileRes.user?.role === 'admin') navigate('/dashboard', { replace: true });
          else navigate('/', { replace: true });

        } catch (error) {
          console.error("Login Failed:", error);
          const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
          
          // Hiển thị toast notification
          ToastNotification(errorMessage, 'error', 5);
          
          // Chờ 1s để user thấy toast rồi mới redirect
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 1000);
        }
      };

      handleCallback();
    } else if (!code) {
      navigate('/login');
    }
  }, [searchParams, navigate, setUser]);

  // Lấy provider từ state để hiển thị message động; nếu không có state thì dùng neutral label
  const providerState = new URLSearchParams(window.location.search).get('state');
  const providerLabel =
    providerState === 'facebook' ? 'Facebook' :
    providerState === 'google' ? 'Google' :
    providerState === 'github' ? 'GitHub' :
    'OAuth provider';

  return (
    <div className="flex justify-center items-center h-screen flex-col bg-white font-sans text-[#153243]">
      <div className="w-[50px] h-[50px] border-[5px] border-[#b5bec6] border-t-[#284b63] rounded-full animate-spin"></div>
      <h3 className="mt-5 font-semibold">Đang đăng nhập {providerLabel}...</h3>
    </div>
  )
}