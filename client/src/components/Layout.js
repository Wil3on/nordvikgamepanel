import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Navigation from './Navigation';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navigation 
        drawerOpen={drawerOpen} 
        toggleDrawer={toggleDrawer} 
        isMobile={isMobile} 
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginTop: '64px',
          marginLeft: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#010714',
          ...(drawerOpen && !isMobile && {
            marginLeft: '70px',
            width: 'calc(100% - 70px)',
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
          ...(drawerOpen && !isMobile && {
            marginLeft: '1%',
            width: 'calc(100% - 240px)',
          }),
        }}
      >
        <Box 
          sx={{ 
            px: { xs: 3, sm: 4, md: 4 },
            py: { xs: 3, sm: 3 },
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 