import axiosInstance from '../utils/axios';

export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
}

const API_URL = '/api/v1/chat';

export const chatService = {
    sendMessage: async (content: string): Promise<Message> => {
        const response = await axiosInstance.post(`${API_URL}/send`, { content });
        return response.data;
    },
    getHistory: async (): Promise<Message[]> => {
        const response = await axiosInstance.get(`${API_URL}/history`);
        return response.data;
    },
};