import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import PricingModal from '../components/PricingModal';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // Sync token with axios interceptor logic (or just localState)
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          // Fetch current user details from Laravel backend (/api/user)
          const response = await api.get('/api/user');
          const userData = response.data;
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to validate token:', error);
          // Token is invalid/expired, clear states
          logoutLocal();
        }
      } else {
        logoutLocal();
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Interceptor to catch 403 limit exceeded errors globally and show the pricing modal
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          error.response.status === 403 &&
          error.response.data &&
          error.response.data.error_code === 'limit_exceeded'
        ) {
          setIsPricingOpen(true);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const logoutLocal = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const login = async (email, password) => {
    try {
      // POST to Auth Login endpoint
      const response = await api.post('/api/v1/auth/login', { email, password });
      const { token: receivedToken } = response.data.data;

      // Save token
      localStorage.setItem('auth_token', receivedToken);
      setToken(receivedToken);

      // Fetch user profile info
      const userResponse = await api.get('/api/user');
      const userData = userResponse.data;

      localStorage.setItem('auth_user', JSON.stringify(userData));
      setUser(userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password, passwordConfirmation) => {
    try {
      // POST to Auth Register endpoint
      const response = await api.post('/api/v1/auth/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      const { user: registeredUser, token: receivedToken } = response.data.data;

      // Save token and user details
      localStorage.setItem('auth_token', receivedToken);
      localStorage.setItem('auth_user', JSON.stringify(registeredUser));
      
      setToken(receivedToken);
      setUser(registeredUser);

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/v1/auth/logout', {});
    } catch (error) {
      console.error('Logout error on backend:', error);
    } finally {
      // Always logout locally
      logoutLocal();
    }
  };

  const value = {
    user,
    setUser,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
    isPricingOpen,
    setIsPricingOpen,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context easily
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
