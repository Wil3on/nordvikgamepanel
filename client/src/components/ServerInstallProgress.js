import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  LinearProgress, 
  Typography, 
  Alert, 
  AlertTitle, 
  Box, 
  IconButton 
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ServerInstallProgress = ({ show, onHide, progress, task, error, serverId }) => {
  const getProgressColor = () => {
    if (error) return 'error';
    if (progress === 100) return 'success';
    return 'primary';
  };

  const canClose = progress === 100 || error;

  return (
    <Dialog 
      open={show} 
      onClose={canClose ? onHide : undefined}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className="flex justify-between items-center">
        <Typography variant="h6">Installing Server</Typography>
        {canClose && (
          <IconButton onClick={onHide} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" className="mb-2">
          Server ID: <span className="font-semibold">{serverId}</span>
        </Typography>
        <Typography variant="body2" className="mb-4">
          Current task: <span className="font-semibold">{task}</span>
        </Typography>
        
        <Box className="mb-4">
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            color={getProgressColor()}
            className="h-2 rounded-full"
          />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            className="mt-1 text-right"
          >
            {Math.round(progress)}%
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" className="mt-4">
            <AlertTitle>Error during installation</AlertTitle>
            An error occurred during the server installation. Please check the server logs for more details.
          </Alert>
        )}
        
        {progress === 100 && !error && (
          <Alert severity="success" className="mt-4">
            <AlertTitle>Installation Complete</AlertTitle>
            The server has been successfully installed!
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServerInstallProgress;