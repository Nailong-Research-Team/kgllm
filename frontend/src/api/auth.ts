import axiosInstance from '../utils/axios';
import { API_CONFIG } from '../config/api';
import { LoginRequest, RegisterRequest } from '../types/user';

export const login = async (credentials: LoginRequest) => {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.LOGIN, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const register = async (data: RegisterRequest) => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.REGISTER, data);
    return response.data;
}; 