import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as logoutAPI, isAuthenticated, getStoredUser } from '@/api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 初始化时检查登录状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isAuthenticated()) {
          // 先从本地存储获取用户信息
          const storedUser = getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            setIsLoggedIn(true);
          }

          // 然后验证 token 并更新用户信息
          const response = await getCurrentUser();
          if (response.success) {
            setUser(response.data.user);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error('验证登录状态失败:', error);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    logoutAPI();
    setUser(null);
    setIsLoggedIn(false);
  };

  const value = {
    user,
    loading,
    isLoggedIn,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
