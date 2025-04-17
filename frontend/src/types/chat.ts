export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'system';
    type: 'text' | 'image';
    timestamp: string;
    user_id: string;
    user_name: string;
    user_avatar?: string;
    created_at: string;
}

export interface SendMessageRequest {
    content: string;
    type: 'text' | 'image';
} 