import React, { useState, useContext, useEffect } from 'react';
import { FormControlLabel, Switch, Box, Typography, Snackbar, Alert } from '@mui/material';
import { ServerContext } from '../contexts/ServerContext';

const LOCAL_STORAGE_KEY = 'userMockApiPreference';

const MockApiToggle = () => {
  const { usingMockApi, toggleMockApi } = useContext(ServerContext);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  
  // Initialize from localStorage or default to false (disabled)
  const [checked, setChecked] = useState(() => {
    const savedPreference = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedPreference !== null) {
      return savedPreference === 'true';
    }
    // Default to false if no preference exists
    return false;
  });
  
  // Effect to update the UI when mock API status changes
  useEffect(() => {
    setChecked(usingMockApi);
  }, [usingMockApi]);
  
  // When component mounts, ensure localStorage is initialized
  useEffect(() => {
    if (localStorage.getItem(LOCAL_STORAGE_KEY) === null) {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'false');
    }
  }, []);
  
  const handleChange = () => {
    // Set the new state directly in localStorage
    const newState = !checked;
    setChecked(newState);
    localStorage.setItem(LOCAL_STORAGE_KEY, String(newState));
    
    // Show appropriate message
    if (!newState) {
      setMessage('Using real API. Connecting to backend server...');
      setSeverity('info');
    } else {
      setMessage('Using mock API. Development mode enabled.');
      setSeverity('success');
    }
    setOpen(true);
    
    // Force a hard reload to completely reset application state
    setTimeout(() => {
      window.location.href = window.location.pathname; // Force a real navigation
    }, 1500);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <>
      <Box sx={{ 
        position: 'fixed', 
        bottom: 16, 
        right: 16, 
        zIndex: 1000,
        bgcolor: 'background.paper',
        p: 1,
        borderRadius: 1,
        boxShadow: 2
      }}>
        <FormControlLabel
          control={
            <Switch
              checked={checked}
              onChange={handleChange}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              Development Mode
            </Typography>
          }
        />
      </Box>
      
      <Snackbar 
        open={open} 
        autoHideDuration={6000} 
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={severity} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MockApiToggle; 