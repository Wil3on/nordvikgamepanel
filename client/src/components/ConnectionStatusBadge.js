import React, { useEffect, useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  SignalWifiConnectedNoInternet4 as NetworkErrorIcon,
  HourglassEmpty as LoadingIcon
} from '@mui/icons-material';
import axios from 'axios';

const ConnectionStatusBadge = () => {
  const [apiStatus, setApiStatus] = useState({ available: false, checking: true });
  const API_URL = process.env.REACT_APP_API_URL || '';

  const checkApiStatus = async () => {
    setApiStatus(prev => ({ ...prev, checking: true }));
    try {
      await axios.get(`${API_URL}/api/servers`);
      setApiStatus({ available: true, checking: false });
    } catch (err) {
      setApiStatus({ available: false, checking: false });
    }
  };

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    if (apiStatus.checking) {
      return {
        icon: <LoadingIcon />,
        label: "Connecting",
        color: "warning",
        bgColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        tooltip: "Checking connection to backend server..."
      };
    } else if (apiStatus.available) {
      return {
        icon: <CheckCircleIcon />,
        label: "Connected",
        color: "success",
        bgColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        tooltip: "Backend server is connected"
      };
    } else {
      return {
        icon: <NetworkErrorIcon />,
        label: "Disconnected",
        color: "error",
        bgColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        tooltip: "Backend server is unavailable"
      };
    }
  };

  const status = getStatusConfig();

  return (
    <Tooltip title={status.tooltip}>
      <Chip
        icon={status.icon}
        label={status.label}
        color={status.color}
        variant="outlined"
        size="small"
        sx={{
          ml: 2,
          mr: 3,
          height: 24,
          fontWeight: 500,
          backdropFilter: 'blur(4px)',
          backgroundColor: status.bgColor,
          border: '1px solid',
          borderColor: status.borderColor,
          '& .MuiChip-label': {
            px: 1,
          }
        }}
      />
    </Tooltip>
  );
};

export default ConnectionStatusBadge; 