// API 配置
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    ENDPOINTS: {
        LOGIN: '/api/v1/auth/token',
        REGISTER: '/api/v1/auth/register',
        USER_PROFILE: '/api/v1/users/profile',
        SYSTEM_STATS: '/api/v1/system/stats',
        ADMIN: {
            USERS: '/api/v1/admin/users',
        }
    }
};

// Axios 默认配置
export const getAxiosConfig = () => ({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
}); 