import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from '../services/authService';
import { setAuthToken } from '../services/api';
import ToastNotification from '../components/common/ToastNotification';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setAuthToken(null);
    setUser(null);
    navigate('./login', { replace: true });
  };

  const fetchCurrentUser = async() => {
    try {
      const profileRes = await authService.getProfile();
      if (profileRes && profileRes.user) {
        setUser(prevUser => {
          const newUser = profileRes.user;
          if (!prevUser || 
              prevUser._id !== newUser._id ||
              prevUser.full_name !== newUser.full_name ||
              prevUser.role !== newUser.role ||
              prevUser.rating_count !== newUser.rating_count ||
              prevUser.rating_score !== newUser.rating_score) {
            return newUser;
          }
          return prevUser;
        });
        return profileRes.user;
      }
      return null;
    } catch (error) {
      console.error("Error fetching current user:", error);

      if (error.response && error.response.status === 401) {
        if (userRef.current) {
          ToastNotification("Phiên đăng nhập hết hạn!", "error");
          await logout();
        }
      }
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await authService.refreshToken();
        if (data.token) {
          const rawToken = data.token.replace('Bearer ', '');
          setAuthToken(rawToken);

          await fetchCurrentUser(); 
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Polling mỗi 60 giây để làm mới thông tin người dùng
    const intervalId = setInterval(() => {
      fetchCurrentUser();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials.email, credentials.password);

      const rawToken = data.accessToken.replace('Bearer ', '');
      setAuthToken(rawToken);

      const current_user = await fetchCurrentUser();

      return { success: true, user: current_user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      setUser,
      login, 
      register, 
      logout,
      loading 
    }}>
      {loading ? (
        <div className="h-screen flex justify-center items-center text-[1.2rem] text-[#555]">
          Running App...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);