import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ServerContext } from '../contexts/ServerContext';
import { CircularProgress, Box, Alert } from '@mui/material';

// This HOC will check if a server is installed before rendering the wrapped component
const withServerInstallCheck = (WrappedComponent) => {
  return (props) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getServer } = useContext(ServerContext);
    const [server, setServer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
      const checkServerInstallation = async () => {
        try {
          setLoading(true);
          const serverData = await getServer(id);
          
          if (!serverData.isInstalled) {
            navigate(`/servers/${id}`, {
              state: {
                message: 'This section requires the server to be installed first',
                severity: 'warning'
              }
            });
            return;
          }
          
          setServer(serverData);
        } catch (err) {
          setError(err.message || 'Failed to verify server installation status');
        } finally {
          setLoading(false);
        }
      };
      
      checkServerInstallation();
    }, [id, getServer, navigate]);
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    
    // Only render the component if the server is installed
    return server && server.isInstalled ? <WrappedComponent {...props} server={server} /> : null;
  };
};

export default withServerInstallCheck; 