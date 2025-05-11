import React from 'react';
import { Box } from '@mui/material';
import TopBar from '../TopBar';
import Sidebar from '../Sidebar';
import { Outlet } from 'react-router-dom';

interface PageLayoutProps {
    projectName: string;
    onLogout: () => void;
}

const PageLayout: React.FC<PageLayoutProps> = ({ projectName, onLogout }) => {
    return (
        <>
            <TopBar projectName={projectName} onLogout={onLogout} />
            <Box
                className="content"
                sx={{
                    height: 'calc(100vh - 50px)',
                    overflow: 'hidden',
                }}>
                <Box sx={{ 
                    display: 'flex', 
                    height: '100%',
                    bgcolor: 'background.default'
                }}>
                    <Box
                        component="nav"
                        sx={{
                            width: 240,
                            flexShrink: 0,
                            height: '100%',
                            bgcolor: 'background.paper',
                            borderRight: 1,
                            borderColor: 'divider',
                        }}>
                        <Sidebar />
                    </Box>
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            height: '100%',
                            bgcolor: 'background.default',
                            overflow: 'auto'
                        }}>
                        <Outlet />
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default PageLayout; 