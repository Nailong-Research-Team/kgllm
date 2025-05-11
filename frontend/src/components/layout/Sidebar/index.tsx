import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
} from '@mui/material';
import {
    Person as PersonIcon,
    Settings as SettingsIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    Dashboard as DashboardIcon,
    Logout as LogoutIcon,
    Chat as ChatIcon,
    BubbleChart as GraphIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userProfile, logout } = useAuth();

    if (!userProfile) {
        return null;
    }

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        if (path === '/settings/profile') {
            return location.pathname === '/settings/profile';
        }
        if (path === '/settings/system') {
            return location.pathname === '/settings/system';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ mr: 2, bgcolor: '#1976d2' }}>
                    {userProfile.full_name[0]}
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {userProfile.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {userProfile.email}
                    </Typography>
                </Box>
            </Box>

            <List>
                <ListItem 
                    button 
                    onClick={() => navigate('/dashboard')}
                    sx={{
                        bgcolor: isActive('/dashboard') ? 'action.selected' : 'transparent',
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                            bgcolor: 'action.hover',
                        }
                    }}
                >
                    <ListItemIcon>
                        <DashboardIcon color={isActive('/dashboard') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="仪表板" />
                </ListItem>
                <ListItem 
                    button 
                    onClick={() => navigate('/settings/profile')}
                    sx={{
                        bgcolor: isActive('/settings/profile') ? 'action.selected' : 'transparent',
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                            bgcolor: 'action.hover',
                        }
                    }}
                >
                    <ListItemIcon>
                        <PersonIcon color={isActive('/settings/profile') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="个人资料" />
                </ListItem>
                <ListItem 
                    button 
                    onClick={() => navigate('/settings/system')}
                    sx={{
                        bgcolor: isActive('/settings/system') ? 'action.selected' : 'transparent',
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                            bgcolor: 'action.hover',
                        }
                    }}
                >
                    <ListItemIcon>
                        <SettingsIcon color={isActive('/settings/system') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="系统设置" />
                </ListItem>
                <ListItem 
                    button 
                    onClick={() => navigate('/chat')}
                    sx={{
                        bgcolor: isActive('/chat') ? 'action.selected' : 'transparent',
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                            bgcolor: 'action.hover',
                        }
                    }}
                >
                    <ListItemIcon>
                        <ChatIcon color={isActive('/chat') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="AI 助手" />
                </ListItem>
                <ListItem 
                    button 
                    onClick={() => navigate('/graph')}
                    sx={{
                        bgcolor: isActive('/graph') ? 'action.selected' : 'transparent',
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                            bgcolor: 'action.hover',
                        }
                    }}
                >
                    <ListItemIcon>
                        <GraphIcon color={isActive('/graph') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="知识图谱" />
                </ListItem>
                {userProfile.role === 'admin' && (
                    <ListItem 
                        button 
                        onClick={() => navigate('/admin')}
                        sx={{
                            bgcolor: isActive('/admin') ? 'action.selected' : 'transparent',
                            borderRadius: 1,
                            mb: 0.5,
                            '&:hover': {
                                bgcolor: 'action.hover',
                            }
                        }}
                    >
                        <ListItemIcon>
                            <AdminPanelSettingsIcon color={isActive('/admin') ? 'primary' : 'inherit'} />
                        </ListItemIcon>
                        <ListItemText primary="管理员面板" />
                    </ListItem>
                )}
                <Divider sx={{ my: 2 }} />
                <ListItem 
                    button 
                    onClick={logout}
                    sx={{
                        borderRadius: 1,
                        '&:hover': {
                            bgcolor: 'action.hover',
                        }
                    }}
                >
                    <ListItemIcon>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="退出登录" />
                </ListItem>
            </List>
        </Box>
    );
};

export default Sidebar; 