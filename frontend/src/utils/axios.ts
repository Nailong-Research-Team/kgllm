import axios from 'axios';
import { API_CONFIG, getAxiosConfig } from '../config/api';

// 创建 axios 实例
const axiosInstance = axios.create(getAxiosConfig());

// 请求拦截器
axiosInstance.interceptors.request.use(
    (config) => {
        // 每次请求前更新 token
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

// 响应拦截器
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // token 过期或无效，重定向到登录页
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 