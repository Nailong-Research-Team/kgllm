import axiosInstance from '../utils/axios';
import { API_CONFIG } from '../config/api';
import { SystemStats } from '../types/system';

export const getSystemStats = async () => {
    const response = await axiosInstance.get<SystemStats>(API_CONFIG.ENDPOINTS.SYSTEM_STATS);
    return response.data;
}; 