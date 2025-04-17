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
import { register } from '../../api/auth';

const Register: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        try {
            await register({
                full_name: fullName,
                email,
                password,
            });
            navigate('/login');
        } catch (error) {
            setError('注册失败，请稍后重试');
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
                    注册
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="全名"
                        fullWidth
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        margin="normal"
                        required
                    />
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
                    <TextField
                        label="确认密码"
                        type="password"
                        fullWidth
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        margin="normal"
                        required
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}>
                        注册
                    </Button>
                    <Box sx={{ textAlign: 'center' }}>
                        <Link
                            href="/login"
                            variant="body2"
                            sx={{ textDecoration: 'none' }}>
                            已有账号？立即登录
                        </Link>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default Register; 