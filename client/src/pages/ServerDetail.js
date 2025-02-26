import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Chip, 
  CircularProgress,
  Divider,
  Alert,
  AlertTitle,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import { 
  Terminal as TerminalIcon,
  SettingsApplications as SettingsIcon,
  Folder as FolderIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  ArrowBack as ArrowBackIcon,
  Code as CodeIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { ServerContext } from '../contexts/ServerContext';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import InstallationGuide from '../components/InstallationGuide';
import { SocketContext } from '../contexts/SocketContext';

const ServerDetail = () => {
  const { id } = useParams();
  const { 
    getServer, 
    startServer, 
    stopServer, 
    installServer,
    loading, 
    usingMockApi 
  } = useContext(ServerContext);
  const [server, setServer] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsInterval, setStatsInterval] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const { installProgress } = useContext(SocketContext);
  const serverProgress = installProgress[id];
  const isInstalling = serverProgress && serverProgress.progress < 100 && !serverProgress.error;

  const fetchServer = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const serverData = await getServer(id);
      setServer(serverData);
    } catch (err) {
      console.error('Error loading server:', err);
      setError(err.message || 'Server not found or could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [id, getServer]);
  
  const fetchStats = useCallback(async () => {
    try {
      if (!server || !server.isRunning) return;
      
      const response = await axios.get(`/api/servers/${id}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching server stats:', err);
    }
  }, [id, server]);
  
  useEffect(() => {
    fetchServer();
  }, [fetchServer]);
  
  useEffect(() => {
    if (server?.isRunning) {
      fetchStats();
      const interval = setInterval(fetchStats, 5000);
      setStatsInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (statsInterval) {
        clearInterval(statsInterval);
        setStatsInterval(null);
      }
      setStats(null);
    }
  }, [server, fetchStats]);

  const handleStart = async () => {
    try {
      await startServer(id);
      fetchServer();
    } catch (err) {
      setError(`Failed to start server: ${err.response?.data?.details || err.message}`);
    }
  };

  const handleStop = async () => {
    try {
      await stopServer(id);
      fetchServer();
    } catch (err) {
      setError(`Failed to stop server: ${err.response?.data?.details || err.message}`);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader 
          title="Server Error"
          subtitle="There was a problem loading the server"
          action={true}
          actionText="Back to Dashboard"
          actionIcon={<ArrowBackIcon />}
          onActionClick={() => navigate('/')}
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
        
        {usingMockApi && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>Using Mock Data</AlertTitle>
            You're in development mode with mock data. Make sure you've created mock servers from the dashboard first.
          </Alert>
        )}
      </Box>
    );
  }

  if (!server) {
    return (
      <Box>
        <PageHeader 
          title="Server Not Found"
          subtitle="The requested server could not be found"
          action={true}
          actionText="Back to Dashboard"
          actionIcon={<ArrowBackIcon />}
          onActionClick={() => navigate('/')}
        />
        <Alert severity="warning" sx={{ mt: 2 }}>
          <AlertTitle>Not Found</AlertTitle>
          No server with ID "{id}" was found.
        </Alert>
      </Box>
    );
  }

  console.log("Server Detail Debug:", {
    serverId: id,
    server,
    isInstalled: server.isInstalled,
    installProgress
  });

  // Disable management tools for uninstalled servers
  const managementToolsDisabled = !server.isInstalled;

  return (
    <Box>
      <PageHeader 
        title="Server Details"
        subtitle={`Manage and configure your server`}
        action={true}
        actionText="Back to Dashboard"
        actionIcon={<ArrowBackIcon />}
        onActionClick={() => navigate('/')}
      />
      
      <Box className="mb-6">
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            mb: 0.5
          }}
        >
          {server.config?.name || server.name || `Server ${server.id}`}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ID: {server.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            •
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Port: {server.config?.port || server.port}
          </Typography>
          <Chip 
            label={server.isRunning ? 'Running' : 'Stopped'} 
            color={server.isRunning ? 'success' : 'default'}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>
      </Box>
      
      <Box className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Stack direction="row" spacing={2}>
          {!server.isRunning ? (
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayIcon />}
              onClick={handleStart}
            >
              Start Server
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleStop}
            >
              Stop Server
            </Button>
          )}
        </Stack>
      </Box>
      
      {(server.isInstalled) && (
        <Box sx={{ 
          mb: 4, 
          border: '1px solid',
          borderColor: 'warning.light',
          borderRadius: 2,
          bgcolor: 'warning.lighter',
          p: 0 
        }}>
          <InstallationGuide 
            server={server} 
            onInstall={() => installServer(id)}
            installProgress={installProgress && installProgress[id]}
          />
        </Box>
      )}
      
      {(!server.isInstalled) && (
        <Box sx={{ 
          mb: 4, 
          border: '1px solid',
          borderColor: 'warning.light',
          borderRadius: 2,
          bgcolor: 'warning.lighter',
          p: 0 
        }}>
          <InstallationGuide 
            server={server} 
            onInstall={() => installServer(id)}
            installProgress={installProgress && installProgress[id]}
          />
        </Box>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} className="p-4 border">
            <Typography variant="h6" gutterBottom>
              Server Information
            </Typography>
            <Divider className="mb-4" />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Port</Typography>
                <Typography variant="body1">{server.config?.port || server.port}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Max Players</Typography>
                <Typography variant="body1">{server.config?.maxPlayers || server.maxPlayers}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Steam App ID</Typography>
                <Typography variant="body1">{server.config?.steamAppId || server.steamAppId || 1874880}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Password Protected</Typography>
                <Typography variant="body1">{(server.config?.password || server.password) ? 'Yes' : 'No'}</Typography>
              </Grid>
              {(server.config?.adminPassword || server.adminPassword) && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Admin Password</Typography>
                  <Typography variant="body1">
                    {server.config?.adminPassword || server.adminPassword}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={0} className="p-4 border">
            <Typography variant="h6" gutterBottom>
              Performance
            </Typography>
            <Divider className="mb-4" />
            
            {server.isRunning && stats ? (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">CPU Usage</Typography>
                  <Typography variant="body1">
                    {stats.cpu ? `${stats.cpu.toFixed(1)}%` : 'Measuring...'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Memory Usage</Typography>
                  <Typography variant="body1">
                    {stats.memory ? `${Math.round(stats.memory)} MB` : 'Measuring...'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Process ID</Typography>
                  <Typography variant="body1">{stats.pid || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Uptime</Typography>
                  <Typography variant="body1">
                    {stats.uptime ? `${Math.floor(stats.uptime / 60)} minutes` : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Box className="text-center py-4">
                <Typography variant="body2" color="text.secondary">
                  Server is not running. Start the server to see performance metrics.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Management Tools</Typography>
            
            {managementToolsDisabled ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Management tools will be available after server installation is complete.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    component={Link}
                    to={`/servers/${id}/config`}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    disabled={managementToolsDisabled}
                  >
                    Configuration
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FolderIcon />}
                    component={Link}
                    to={`/servers/${id}/files`}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    disabled={managementToolsDisabled}
                  >
                    File Manager
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CodeIcon />}
                    component={Link}
                    to={`/servers/${id}/console`}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    disabled={managementToolsDisabled}
                  >
                    Console
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    component={Link}
                    to={`/servers/${id}/players`}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    disabled={managementToolsDisabled}
                  >
                    Players
                  </Button>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServerDetail;