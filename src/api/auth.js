import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 创建 axios 实例
const authAPI = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 用户注册
export const register = async (username, email, password) => {
  try {
    const response = await authAPI.post('/register', {
      username,
      email,
      password,
    });
    
    if (response.data.success) {
      // 保存 token 到 localStorage
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: '注册失败' };
  }
};

// 用户登录
export const login = async (username, password) => {
  try {
    const response = await authAPI.post('/login', {
      username,
      password,
    });
    
    if (response.data.success) {
      // 保存 token 到 localStorage
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: '登录失败' };
  }
};

// 获取当前用户信息
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('未登录');
    }
    
    const response = await authAPI.get('/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    // 如果 token 无效，清除本地存储
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw error.response?.data || { success: false, message: '获取用户信息失败' };
  }
};

// 用户登出
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// 检查是否已登录
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// 获取存储的用户信息
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
