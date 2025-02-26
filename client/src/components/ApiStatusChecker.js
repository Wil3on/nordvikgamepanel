import React, { useEffect, useState } from 'react';
import { Box, Alert, Button, Typography, Chip } from '@mui/material';
import { CheckCircle as CheckCircleIcon, SignalWifiConnectedNoInternet4 as NetworkErrorIcon } from '@mui/icons-material';
import axios from 'axios';

const ApiStatusChecker = () => {
  const [apiStatus, setApiStatus] = useState({ available: true, checking: true });

  const checkApiStatus = async () => {
    setApiStatus({ ...apiStatus, checking: true });
    try {
      // Try to access the API health endpoint
      await axios.get('/api/servers');
      setApiStatus({ available: true, checking: false });
    } catch (err) {
      setApiStatus({ available: false, checking: false });
    }
  };

  useEffect(() => {
    checkApiStatus();
    // Check API status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (apiStatus.checking) {
    return null;
  }

  if (apiStatus.available) {
    return (
      <Box sx={{ 
        position: 'fixed', 
        bottom: 64, 
        right: 16, 
        zIndex: 1000,
      }}>
        <Chip
          icon={<CheckCircleIcon />}
          label="Backend Connected"
          color="success"
          variant="outlined"
          size="small"
          sx={{
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            '& .MuiChip-label': {
              px: 1,
              fontWeight: 500
            }
          }}
        />
      </Box>
    );
  }

  return (
    <Alert 
      severity="warning" 
      sx={{ 
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'rgba(245, 158, 11, 0.1)',
        borderLeft: '4px solid',
        borderColor: 'warning.main'
      }}
      icon={<NetworkErrorIcon />}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>API Unavailable</Typography>
        <Typography variant="body2">
          The backend API service seems to be offline. Server management features will not work until the service is available.
        </Typography>
      </Box>
      <Button 
        variant="outlined" 
        color="warning" 
        size="small" 
        onClick={checkApiStatus}
        sx={{ ml: 2 }}
      >
        Retry
      </Button>
    </Alert>
  );
};

export default ApiStatusChecker; 