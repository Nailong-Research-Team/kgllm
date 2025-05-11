export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
    sender?: string;
    type?: string;
    user_id?: string;
    user_name?: string;
    user_avatar?: string;
    created_at?: string;
}

export interface SendMessageRequest {
    content: string;
    type: 'text' | 'image';
} 