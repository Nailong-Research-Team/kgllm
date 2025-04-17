import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const success = await login(email, password);
            if (success) {
                navigate('/dashboard');
            } else {
                setError('登录失败，请检查用户名和密码');
            }
        } catch (error) {
            setError('登录失败，请稍后重试');
        }
    };

    return (
        <Box
            sx={{
                height: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
            }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: 400,
                }}>
                <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
                    登录
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="邮箱"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        required
                    />
                    <TextField
                        label="密码"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        required
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}>
                        登录
                    </Button>
                    <Box sx={{ textAlign: 'center' }}>
                        <Link
                            href="/register"
                            variant="body2"
                            sx={{ textDecoration: 'none' }}>
                            还没有账号？立即注册
                        </Link>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default Login; 