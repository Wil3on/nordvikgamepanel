import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent, 
  Typography, 
  Button, 
  Paper, 
  LinearProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent
} from '@mui/material';
import {
  Download as DownloadIcon,
  Check as CheckIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const InstallationGuide = ({ server, onInstall, installProgress }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [installError, setInstallError] = useState(null);
  
  const handleInstall = () => {
    setActiveStep(1);
    setInstallError(null);
    try {
      onInstall();
    } catch (err) {
      setInstallError(err.message || "Failed to start installation");
      console.error("Installation error:", err);
    }
  };
  
  useEffect(() => {
    if (installProgress && installProgress.progress === 100 && !installProgress.error) {
      const timer = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [installProgress]);
  
  const steps = [
    {
      label: 'Install Server Files',
      description: 'Download and install the server software from Steam',
      action: (
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={handleInstall}
          sx={{ mt: 2 }}
        >
          Start Installation
        </Button>
      )
    },
    {
      label: 'Configure Server',
      description: 'Configure your server settings',
      action: (
        <Button 
          variant="contained" 
          startIcon={<SettingsIcon />}
          href={`/servers/${server.id}/config`}
          disabled={!server.isInstalled}
          sx={{ mt: 2 }}
        >
          Configure Server
        </Button>
      )
    },
    {
      label: 'Start Server',
      description: 'Launch your game server',
      action: (
        <Button 
          variant="contained" 
          color="success"
          startIcon={<PlayArrowIcon />}
          disabled={!server.isInstalled}
          sx={{ mt: 2 }}
        >
          Start Server
        </Button>
      )
    }
  ];
  
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2">
            Server Setup Required
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your server requires installation before it can be started. Follow these steps to complete setup.
        </Typography>
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>
                
                {index === 1 && installProgress && (
                  <Box sx={{ my: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={installProgress.progress || 0} 
                        color={installProgress.error ? 'error' : 'primary'}
                        sx={{ height: 8, borderRadius: 2, flexGrow: 1 }}
                      />
                      <Typography variant="body2" sx={{ ml: 2, minWidth: '45px', fontWeight: 500 }}>
                        {Math.round(installProgress.progress || 0)}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      {installProgress.task || 'Preparing installation...'}
                    </Typography>
                    
                    {installProgress.error && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        Installation failed. Please try again.
                      </Alert>
                    )}
                    
                    {installProgress.progress === 100 && !installProgress.error && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        <AlertTitle>Installation Complete!</AlertTitle>
                        Server files have been installed successfully.
                      </Alert>
                    )}
                  </Box>
                )}
                
                {installError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <AlertTitle>Installation Error</AlertTitle>
                    {installError}
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="error" 
                      sx={{ mt: 1 }}
                      onClick={() => setActiveStep(0)}
                    >
                      Try Again
                    </Button>
                  </Alert>
                )}
                
                {step.action}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

export default InstallationGuide; 