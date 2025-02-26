import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ServerContext } from '../contexts/ServerContext';
import { 
  Box, 
  Paper,
  Typography,
  CircularProgress, 
  Alert, 
  AlertTitle,
  Button,
  Grid,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { 
  ArrowBack as BackIcon,
  Construction as ConstructionIcon,
  FileDownload as DownloadIcon,
  FileUpload as UploadIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';

const FileManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getServer } = useContext(ServerContext);
  
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load server data to check installation status
  useEffect(() => {
    const loadServer = async () => {
      try {
        setLoading(true);
        const serverData = await getServer(id);
        
        // Ensure server is installed before showing file manager
        if (!serverData.isInstalled) {
          navigate(`/servers/${id}`, {
            state: {
              message: 'File manager is only available for installed servers',
              severity: 'warning'
            }
          });
          return;
        }
        
        setServer(serverData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading server:', err);
        setError(err.message || 'Failed to load server data');
        setLoading(false);
      }
    };
    
    loadServer();
  }, [id, getServer, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <PageHeader 
          title="File Manager Error"
          subtitle="There was a problem loading the file manager"
          action={true}
          actionText="Back to Server"
          actionIcon={<BackIcon />}
          onActionClick={() => navigate(`/servers/${id}`)}
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }
  
  if (!server) return null;
  
  return (
    <Box>
      <PageHeader 
        title="File Manager"
        subtitle={`Manage files for ${server.name || `Server ${id}`}`}
        action={true}
        actionText="Back to Server"
        actionIcon={<BackIcon />}
        onActionClick={() => navigate(`/servers/${id}`)}
      />
      
      <Alert 
        severity="info" 
        sx={{ mb: 4 }}
        icon={<ConstructionIcon />}
      >
        <AlertTitle>File Manager Under Development</AlertTitle>
        The complete file manager functionality is currently being developed. Basic file operations will be available soon.
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <FolderIcon sx={{ mr: 1 }} /> Common Directories
              </Typography>
              
              <Stack spacing={1.5}>
                <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  /config - Server Configuration
                </Button>
                <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  /logs - Server Logs
                </Button>
                <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  /mods - Server Modifications
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Actions</Typography>
              
              <Stack spacing={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<UploadIcon />}
                  disabled
                >
                  Upload Files
                </Button>
                
                <Button 
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  disabled
                >
                  Download Files
                </Button>
              </Stack>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                File operations are currently disabled while we complete the file manager implementation.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Coming soon: Full file browse/edit/upload/download capabilities.
        </Typography>
      </Box>
    </Box>
  );
};

export default FileManager; 