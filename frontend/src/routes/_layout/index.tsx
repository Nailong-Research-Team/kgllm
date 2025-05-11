import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const Layout = () => {
    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Outlet />
        </Box>
    );
};

export default Layout; 