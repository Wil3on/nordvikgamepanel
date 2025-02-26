import React, { useContext } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { Code as CodeIcon } from '@mui/icons-material';
import { ServerContext } from '../contexts/ServerContext';

const DevelopmentModeIndicator = () => {
  const { usingMockApi } = useContext(ServerContext);
  
  if (!usingMockApi) return null;
  
  return (
    <Box sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 2000 }}>
      <Tooltip title="Using mock data for development - no actual server operations will be performed">
        <Chip
          icon={<CodeIcon fontSize="small" />}
          label="Development Mode"
          color="info"
          variant="outlined"
          sx={{
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            border: '1px solid rgba(25, 118, 210, 0.3)',
            '& .MuiChip-label': {
              px: 1,
            }
          }}
        />
      </Tooltip>
    </Box>
  );
};

export default DevelopmentModeIndicator; 