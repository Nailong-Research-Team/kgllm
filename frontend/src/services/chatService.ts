import axios from 'axios';

export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
}

const API_URL = '/api/chat';

export const chatService = {
    sendMessage: async (content: string): Promise<Message> => {
        const response = await axios.post(`${API_URL}/send`, { content });
        return response.data;
    },

    getHistory: async (): Promise<Message[]> => {
        const response = await axios.get(`${API_URL}/history`);
        return response.data;
    },
}; 