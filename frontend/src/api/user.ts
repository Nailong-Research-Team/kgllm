import { User, UserProfile } from '../types/user';
import { apiClient } from './client';

export const getUserProfile = async () => {
    const response = await apiClient.get<UserProfile>('/api/v1/users/profile');
    return response.data;
};

export const updateUserProfile = async (data: Partial<UserProfile>) => {
    const response = await apiClient.put('/api/v1/users/profile', data);
    return response.data;
};

export const updatePassword = async (oldPassword: string, newPassword: string) => {
    const response = await apiClient.put(`/api/v1/users/profile/password`, {
        old_password: oldPassword,
        new_password: newPassword,
    });
    return response.data;
};

// Admin API
export const getAllUsers = async () => {
    const response = await apiClient.get<User[]>('/api/v1/admin/users');
    return response.data;
};

export const updateUser = async (userId: number, data: Partial<User>) => {
    const response = await apiClient.put(`/api/v1/admin/users/${userId}`, data);
    return response.data;
};

export const deleteUser = async (userId: number) => {
    const response = await apiClient.delete(`/api/v1/admin/users/${userId}`);
    return response.data;
}; 