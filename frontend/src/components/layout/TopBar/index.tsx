import React, { useContext } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Button,
} from '@mui/material';
import {
    Brightness4 as DarkIcon,
    Brightness7 as LightIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { ThemeContext } from '../../../App';
import './TopBar.css';

interface TopBarProps {
    projectName: string;
    onLogout: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ projectName, onLogout }) => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const { themeMode, toggleTheme } = useContext(ThemeContext);

    const handleLogout = () => {
        logout();
        onLogout();
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderBottom: 1,
                borderColor: 'divider',
                boxShadow: 'none',
            }}>
            <Toolbar sx={{ height: 50 }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        flexGrow: 1,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                    onClick={() => navigate('/')}>
                    {projectName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={toggleTheme} color="inherit">
                        {themeMode === 'dark' ? <LightIcon /> : <DarkIcon />}
                    </IconButton>
                    {/* {!isAuthenticated ? (
                        <>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/login')}>
                                登录
                            </Button>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/register')}>
                                注册
                            </Button>
                        </>
                    ) : (
                        <IconButton color="inherit" onClick={handleLogout}>
                            <LogoutIcon />
                        </IconButton>
                    )} */}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default TopBar; 