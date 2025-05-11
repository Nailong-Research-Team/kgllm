import { Message, SendMessageRequest } from '../types/chat';
import { apiClient } from './client';

export const chatApi = {
    getMessages: async () => {
        const response = await apiClient.get<Message[]>('/api/v1/chat/history');
        return response.data;
    },

    sendMessage: async (message: SendMessageRequest) => {
        const response = await apiClient.post<Message>('/api/v1/chat/send', message.content);
        return response.data;
    }
}; 