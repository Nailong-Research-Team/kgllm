import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/auth';
import { getUserProfile } from '../api/user';
import { UserProfile } from '../types/user';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const data = await getUserProfile();
            setUserProfile(data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('获取用户信息失败:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const { access_token } = await loginApi({ email, password });
            localStorage.setItem('token', access_token);
            await fetchUserProfile();
            navigate('/dashboard');
            return true;
        } catch (error) {
            console.error('登录失败:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserProfile(null);
        navigate('/login');
    };

    return {
        isAuthenticated,
        userProfile,
        loading,
        login,
        logout,
    };
}; 