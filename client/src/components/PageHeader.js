import React from 'react';
import { Box, Typography, Button, useTheme, alpha } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const PageHeader = ({ 
  title, 
  subtitle, 
  action, 
  actionIcon = <AddIcon />,
  actionText = 'New Server',
  onActionClick 
}) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 1
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 0.5,
            fontSize: { xs: '1.5rem', sm: '1.75rem' }
          }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {action && (
          <Button
            variant="contained"
            color="primary"
            startIcon={actionIcon}
            onClick={onActionClick}
            sx={{
              fontWeight: 500,
              px: 2,
              py: 1,
              borderRadius: 2,
              boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.6)}`,
              },
            }}
          >
            {actionText}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader; 