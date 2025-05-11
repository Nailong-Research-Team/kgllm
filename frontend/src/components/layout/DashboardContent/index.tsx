import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    CardActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getUserProfile } from '../../../api/user';
import { chatApi } from '../../../api/chat';
import { UserProfile } from '../../../types/user';
import { Message } from '../../../types/chat';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GraphIcon from '@mui/icons-material/BubbleChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format } from 'date-fns';

const DashboardContent: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [recentMessages, setRecentMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 获取用户资料
                const profileData = await getUserProfile();
                setUserProfile(profileData);
                
                // 获取最近的聊天记录
                const messagesData = await chatApi.getMessages();
                setRecentMessages(messagesData.slice(0, 5)); // 只显示最近5条消息
            } catch (error) {
                console.error('获取仪表盘数据失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // 格式化时间函数
    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, 'yyyy-MM-dd HH:mm');
        } catch (error) {
            console.error('日期格式化错误:', error);
            // 如果格式化失败，使用简单的日期显示方式
            const date = new Date(dateString);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                欢迎回来，{userProfile?.full_name || '用户'}
            </Typography>
            
            <Grid container spacing={3}>
                {/* 用户资料卡片 */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                                <Avatar 
                                    src={userProfile?.avatar_url} 
                                    sx={{ width: 80, height: 80, mb: 2 }}
                                >
                                    {userProfile?.full_name?.charAt(0) || 'U'}
                                </Avatar>
                                <Typography variant="h5">{userProfile?.full_name}</Typography>
                                <Typography variant="body2" color="text.secondary">{userProfile?.email}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {userProfile?.role === 'admin' ? '管理员' : '普通用户'}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2">
                                <strong>位置:</strong> {userProfile?.location || '未设置'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>简介:</strong> {userProfile?.bio || '未设置个人简介'}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button 
                                size="small" 
                                component={Link} 
                                to="/settings/profile"
                                startIcon={<SettingsIcon />}
                            >
                                编辑资料
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
                
                {/* 最近聊天记录 */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">最近聊天记录</Typography>
                                <Button 
                                    size="small" 
                                    component={Link} 
                                    to="/chat"
                                    startIcon={<ChatIcon />}
                                >
                                    查看全部
                                </Button>
                            </Box>
                            <List>
                                {recentMessages.length > 0 ? (
                                    recentMessages.map((message, index) => (
                                        <React.Fragment key={message.id}>
                                            {index > 0 && <Divider variant="inset" component="li" />}
                                            <ListItem alignItems="flex-start">
                                                <ListItemAvatar>
                                                    <Avatar>
                                                        {message.role === 'user' ? 'U' : 'A'}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={message.role === 'user' ? '我' : '助手'}
                                                    secondary={
                                                        <>
                                                            <Typography
                                                                sx={{ display: 'inline' }}
                                                                component="span"
                                                                variant="body2"
                                                                color="text.primary"
                                                            >
                                                                {message.content.length > 50 
                                                                    ? `${message.content.substring(0, 50)}...` 
                                                                    : message.content}
                                                            </Typography>
                                                            <Typography variant="caption" display="block">
                                                                {formatTime(message.timestamp)}
                                                            </Typography>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="暂无聊天记录" />
                                    </ListItem>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
                
                {/* 快速访问卡片 */}
                <Grid item xs={12}>
                    <Card sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>快速访问</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                    <Paper 
                                        component={Link} 
                                        to="/chat"
                                        sx={{ 
                                            p: 3, 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center',
                                            textDecoration: 'none',
                                            color: 'text.primary',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)'
                                            }
                                        }}
                                    >
                                        <ChatIcon sx={{ fontSize: 40, mb: 1 }} color="primary" />
                                        <Typography variant="body1">聊天</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper 
                                        component={Link} 
                                        to="/graph"
                                        sx={{ 
                                            p: 3, 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center',
                                            textDecoration: 'none',
                                            color: 'text.primary',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)'
                                            }
                                        }}
                                    >
                                        <GraphIcon sx={{ fontSize: 40, mb: 1 }} color="secondary" />
                                        <Typography variant="body1">知识图谱</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper 
                                        component={Link} 
                                        to="/settings/profile"
                                        sx={{ 
                                            p: 3, 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center',
                                            textDecoration: 'none',
                                            color: 'text.primary',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)'
                                            }
                                        }}
                                    >
                                        <AccountCircleIcon sx={{ fontSize: 40, mb: 1 }} color="info" />
                                        <Typography variant="body1">个人资料</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper 
                                        component={Link} 
                                        to="/settings/system"
                                        sx={{ 
                                            p: 3, 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center',
                                            textDecoration: 'none',
                                            color: 'text.primary',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)'
                                            }
                                        }}
                                    >
                                        <SettingsIcon sx={{ fontSize: 40, mb: 1 }} color="warning" />
                                        <Typography variant="body1">系统设置</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardContent;