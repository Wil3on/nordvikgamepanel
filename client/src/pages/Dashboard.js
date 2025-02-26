import React, { useContext, useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Box,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress,
  Fab,
  InputAdornment,
  FormHelperText,
  FormControl,
  InputLabel,
  OutlinedInput,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { ServerContext } from '../contexts/ServerContext';
import ServerCard from '../components/ServerCard';
import PageHeader from '../components/PageHeader';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';
import ApiStatusChecker from '../components/ApiStatusChecker';
import { useSnackbar } from 'notistack';

const Dashboard = () => {
  const { servers, loading, error, createServer, startServer, stopServer, deleteServer, installServer, refetchServers } = useContext(ServerContext);
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  const [showModal, setShowModal] = useState(false);
  const [newServerId, setNewServerId] = useState('');
  const [newServerName, setNewServerName] = useState('');
  const [newServerPort, setNewServerPort] = useState(2001);
  const [newServerMaxPlayers, setNewServerMaxPlayers] = useState(32);
  const [newServerAppId, setNewServerAppId] = useState(1874880);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [creatingServer, setCreatingServer] = useState(false);
  const [createError, setCreateError] = useState(null);
  
  useEffect(() => {
    if (searchParams.get('newServer') === 'true') {
      setShowModal(true);
      searchParams.delete('newServer');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!newServerId) {
      errors.id = 'Server ID is required';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(newServerId)) {
      errors.id = 'Server ID can only contain letters, numbers, dashes and underscores';
    }
    
    if (!newServerName) {
      errors.name = 'Server name is required';
    }
    
    if (!newServerPort) {
      errors.port = 'Port is required';
    } else if (newServerPort < 1 || newServerPort > 65535) {
      errors.port = 'Port must be between 1 and 65535';
    }
    
    if (!newServerMaxPlayers) {
      errors.maxPlayers = 'Max players is required';
    } else if (newServerMaxPlayers < 1 || newServerMaxPlayers > 128) {
      errors.maxPlayers = 'Max players must be between 1 and 128';
    }
    
    if (!newServerAppId) {
      errors.appId = 'Steam App ID is required';
    }
    
    return errors;
  };
  
  const handleCreateServer = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      const newServer = await createServer(newServerId, {
        name: newServerName,
        port: newServerPort,
        maxPlayers: newServerMaxPlayers,
        steamAppId: newServerAppId
      });
      
      setShowModal(false);
      setNewServerId('');
      setNewServerName('');
      setNewServerPort(2001);
      setNewServerMaxPlayers(32);
      setNewServerAppId(1874880);
      
      navigate(`/servers/${newServer.id}`);
    } catch (err) {
      console.error("Error creating server:", err);
      setCreateError(err.message || "Failed to create server");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCreateMockServer = () => {
    setShowModal(false);
    
    const mockServer = {
      id: newServerId || `server-${Math.floor(Math.random() * 1000)}`,
      name: newServerName || 'Mock Server',
      port: newServerPort || 2001,
      maxPlayers: newServerMaxPlayers || 32,
      steamAppId: newServerAppId || 1874880,
      isRunning: false,
      isInstalled: false,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      uptime: 0,
      players: []
    };
    
    const storedServers = JSON.parse(localStorage.getItem('mockServers') || '[]');
    const updatedServers = [...storedServers, mockServer];
    localStorage.setItem('mockServers', JSON.stringify(updatedServers));
    
    refetchServers();
    
    setNewServerId('');
    setNewServerName('');
    setNewServerPort(2001);
    setNewServerMaxPlayers(32);
    setNewServerAppId(1874880);
    
    enqueueSnackbar('Mock server created for UI testing', { 
      variant: 'info',
      autoHideDuration: 3000
    });
  };
  
  const totalServers = servers.length || 0;
  const runningServers = servers.filter(s => s.isRunning).length || 0;
  const runningPercentage = totalServers > 0 ? Math.round((runningServers / totalServers) * 100) : 0;
  const isPositiveGrowth = true;
  
  const handleRetryFetch = () => {
    refetchServers();
  };
  
  return (
    <Box>
      {error && (
        <ErrorAlert 
          message={typeof error === 'object' ? error.message : error}
          code={typeof error === 'object' ? error.code : null}
          retryAction={handleRetryFetch}
        />
      )}
      
      <ApiStatusChecker />
      
      <PageHeader
        title="Dashboard"
        subtitle={`Manage your ${servers.length} game server${servers.length !== 1 ? 's' : ''}`}
        action
        actionText="New Server"
        onActionClick={() => setShowModal(true)}
      />
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.2) 0%, transparent 40%)',
              zIndex: 0
            }
          }}>
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">Total Servers</Typography>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: '50%', 
                  bgcolor: alpha(theme.palette.primary.main, 0.2), 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <StorageIcon color="primary" />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>{totalServers}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip 
                  label={`${runningServers} running`} 
                  size="small" 
                  color="success"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {totalServers - runningServers} stopped
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
              zIndex: 0
            }
          }}>
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">Server Status</Typography>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(37, 99, 235, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <MemoryIcon color="primary" />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>{`${runningPercentage}%`}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {isPositiveGrowth ? (
                  <TrendingUpIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                ) : (
                  <TrendingDownIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                )}
                <Typography variant="body2" color={isPositiveGrowth ? "success.main" : "error.main"}>
                  {isPositiveGrowth ? '+5%' : '-5%'} from last week
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              zIndex: 0
            }
          }}>
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">Active Players</Typography>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(37, 99, 235, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <PeopleIcon color="primary" />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>0</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  No players connected
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3, 
        pb: 2,
        borderBottom: '1px solid rgba(37, 99, 235, 0.1)'
      }}>
        <Typography variant="h5">Your Servers</Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : servers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No servers yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Get started by creating your first game server.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => setShowModal(true)}
            startIcon={<AddIcon />}
          >
            Create Server
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {servers.map((server) => (
            server ? (
              <Grid item xs={12} md={6} lg={4} key={server.id || Math.random()}>
                <ServerCard 
                  server={server} 
                  onStart={() => startServer(server.id)} 
                  onStop={() => stopServer(server.id)} 
                  onDelete={() => deleteServer(server.id)}
                  onInstall={() => installServer(server.id)}
                />
              </Grid>
            ) : null
          ))}
        </Grid>
      )}
      
      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          pt: 3,
          px: 3
        }}>
          <Typography variant="h5" fontWeight={600}>Create New Server</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {formErrors.submit && (
            <Alert severity="error" className="mb-4">
              {formErrors.submit}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Server ID"
            variant="outlined"
            margin="normal"
            value={newServerId}
            onChange={e => setNewServerId(e.target.value)}
            error={!!formErrors.id}
            helperText={formErrors.id || "A unique identifier for your server (e.g. 'main-server')"}
            disabled={isSubmitting}
            className="mb-4"
          />
          
          <TextField
            fullWidth
            label="Server Name"
            variant="outlined"
            margin="normal"
            value={newServerName}
            onChange={e => setNewServerName(e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name || "The display name for your server"}
            disabled={isSubmitting}
            className="mb-4"
          />
          
          <TextField
            fullWidth
            label="Port"
            variant="outlined"
            margin="normal"
            type="number"
            value={newServerPort}
            onChange={e => setNewServerPort(parseInt(e.target.value) || '')}
            error={!!formErrors.port}
            helperText={formErrors.port || "The network port for your server (default: 2001)"}
            disabled={isSubmitting}
            inputProps={{ min: 1, max: 65535 }}
            className="mb-4"
          />
          
          <TextField
            fullWidth
            label="Max Players"
            variant="outlined"
            margin="normal"
            type="number"
            value={newServerMaxPlayers}
            onChange={e => setNewServerMaxPlayers(parseInt(e.target.value) || '')}
            error={!!formErrors.maxPlayers}
            helperText={formErrors.maxPlayers}
            disabled={isSubmitting}
            inputProps={{ min: 1, max: 128 }}
            className="mb-4"
          />
          
          <FormControl fullWidth margin="normal" error={!!formErrors.appId} disabled={isSubmitting}>
            <InputLabel htmlFor="serverAppId">Steam App ID</InputLabel>
            <OutlinedInput
              id="serverAppId"
              value={newServerAppId}
              onChange={e => setNewServerAppId(parseInt(e.target.value) || '')}
              endAdornment={
                <InputAdornment position="end">
                  <Box 
                    component="span" 
                    sx={{
                      fontSize: '0.75rem',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 'rgba(37, 99, 235, 0.15)',
                      color: 'primary.main',
                      fontWeight: 500,
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                    }}
                  >
                    Arma Reforger: 1874880
                  </Box>
                </InputAdornment>
              }
              label="Steam App ID"
            />
            {(formErrors.appId || true) && (
              <FormHelperText>
                {formErrors.appId || "The Steam App ID for the server software"}
              </FormHelperText>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
            {process.env.NODE_ENV === 'development' && (
              <Button 
                size="small"
                variant="outlined"
                color="info"
                onClick={() => handleCreateMockServer()}
                startIcon={<CodeIcon />}
                sx={{ mr: 1 }}
              >
                Create Mock Server
              </Button>
            )}
          </Box>
          <Button 
            onClick={() => setShowModal(false)} 
            color="inherit"
            disabled={isSubmitting}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateServer} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSubmitting ? 'Creating...' : 'Create Server'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;