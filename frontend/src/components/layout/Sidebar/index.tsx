import React from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile, logout } = useAuth();

    if (!userProfile) {
        return null;
    }

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
                <ListItem button onClick={() => navigate('/dashboard')}>
                    <ListItemIcon>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="仪表板" />
                </ListItem>
                <ListItem button onClick={() => navigate('/settings/profile')}>
                    <ListItemIcon>
                        <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="个人资料" />
                </ListItem>
                <ListItem button onClick={() => navigate('/settings/system')}>
                    <ListItemIcon>
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="系统设置" />
                </ListItem>
                <ListItem button onClick={() => navigate('/chat')}>
                    <ListItemIcon>
                        <ChatIcon />
                    </ListItemIcon>
                    <ListItemText primary="AI 助手" />
                </ListItem>
                {userProfile.role === 'admin' && (
                    <ListItem button onClick={() => navigate('/admin')}>
                        <ListItemIcon>
                            <AdminPanelSettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="管理员面板" />
                    </ListItem>
                )}
                <Divider sx={{ my: 2 }} />
                <ListItem button onClick={logout}>
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