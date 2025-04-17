import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
} from '@mui/material';
import { getSystemStats } from '../../../api/system';
import { SystemStats } from '../../../types/system';

const DashboardContent: React.FC = () => {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSystemStats = async () => {
            try {
                const data = await getSystemStats();
                setStats(data);
            } catch (error) {
                console.error('获取系统状态失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSystemStats();
        const interval = setInterval(fetchSystemStats, 5000); // 每5秒更新一次

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                系统状态
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            borderRadius: 2,
                        }}>
                        <Typography variant="h6" color="text.secondary">
                            CPU 使用率
                        </Typography>
                        <Typography variant="h4">
                            {stats?.cpu_usage.toFixed(1)}%
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            borderRadius: 2,
                        }}>
                        <Typography variant="h6" color="text.secondary">
                            内存使用率
                        </Typography>
                        <Typography variant="h4">
                            {stats?.memory_usage.toFixed(1)}%
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            borderRadius: 2,
                        }}>
                        <Typography variant="h6" color="text.secondary">
                            磁盘使用率
                        </Typography>
                        <Typography variant="h4">
                            {stats?.disk_usage.toFixed(1)}%
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            borderRadius: 2,
                        }}>
                        <Typography variant="h6" color="text.secondary">
                            网络 I/O
                        </Typography>
                        <Typography variant="body1">
                            发送: {stats?.network_io?.bytes_sent 
                                ? (stats.network_io.bytes_sent / 1024 / 1024).toFixed(2)
                                : '0.00'} MB
                        </Typography>
                        <Typography variant="body1">
                            接收: {stats?.network_io?.bytes_recv
                                ? (stats.network_io.bytes_recv / 1024 / 1024).toFixed(2)
                                : '0.00'} MB
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardContent; 