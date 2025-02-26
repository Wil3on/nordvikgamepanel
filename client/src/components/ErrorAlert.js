import React from 'react';
import { 
  Alert, 
  AlertTitle, 
  Button, 
  Box, 
  Typography, 
  Paper 
} from '@mui/material';
import { 
  RefreshRounded as RefreshIcon,
  ErrorOutlineRounded as ErrorIcon,
  SignalWifiConnectedNoInternet4 as NetworkErrorIcon
} from '@mui/icons-material';

const ErrorAlert = ({ message, retryAction, severity = "error", code }) => {
  // Determine if it's a 404 error
  const is404Error = code === 404 || message?.includes('404') || message?.includes('status code 404');
  
  // Set appropriate title and description based on error type
  let title = "Connection Error";
  let description = message || "We couldn't connect to the server. Please check your connection and try again.";
  let icon = <ErrorIcon color="error" sx={{ mr: 2, fontSize: 28 }} />;
  
  if (is404Error) {
    title = "API Endpoint Not Found";
    description = "The requested API endpoint does not exist. This could mean the server is still starting up or the API route hasn't been implemented.";
    icon = <NetworkErrorIcon color="error" sx={{ mr: 2, fontSize: 28 }} />;
  }
  
  return (
    <Paper 
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        border: '1px solid rgba(239, 68, 68, 0.2)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        {icon}
        <Box>
          <Typography variant="h6" component="h2" sx={{ mb: 0.5, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
      
      {retryAction && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={retryAction}
            size="small"
          >
            Retry Connection
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ErrorAlert; 