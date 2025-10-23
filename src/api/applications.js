import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 创建 axios 实例
const applicationsAPI = axios.create({
  baseURL: `${API_URL}/applications`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
applicationsAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理认证错误
applicationsAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

// 获取所有求职申请
export const getApplications = async () => {
  try {
    const response = await applicationsAPI.get('/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: '获取数据失败' };
  }
};

// 获取单个求职申请
export const getApplication = async (id) => {
  try {
    const response = await applicationsAPI.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: '获取数据失败' };
  }
};

// 创建求职申请
export const createApplication = async (data) => {
  try {
    const response = await applicationsAPI.post('/', {
      company: data.company,
      base: data.base,
      jd: data.jd,
      resumeVersion: data.resumeVersion,
      applicationLink: data.applicationLink,
      applicationDate: data.applicationDate,
      status: data.status || '简历投递',
      notes: data.notes,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: '创建失败' };
  }
};

// 更新求职申请
export const updateApplication = async (id, data) => {
  try {
    const response = await applicationsAPI.put(`/${id}`, {
      company: data.company,
      base: data.base,
      jd: data.jd,
      resumeVersion: data.resumeVersion,
      applicationLink: data.applicationLink,
      applicationDate: data.applicationDate,
      status: data.status,
      notes: data.notes,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: '更新失败' };
  }
};

// 删除求职申请
export const deleteApplication = async (id) => {
  try {
    const response = await applicationsAPI.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: '删除失败' };
  }
};
