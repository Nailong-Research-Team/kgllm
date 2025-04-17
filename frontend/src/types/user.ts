export interface User {
    id: number;
    full_name: string;
    email: string;
    role: 'admin' | 'user';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserProfile extends Omit<User, 'is_active'> {
    avatar_url?: string;
    bio?: string;
    location?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export type LoginCredentials = LoginRequest;

export interface RegisterRequest {
    full_name: string;
    email: string;
    password: string;
}

export type RegisterData = RegisterRequest;

export interface AuthResponse {
    token: string;
    user: UserProfile;
} 