import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  TextField, 
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
  FormHelperText,
  FormControl,
  InputLabel,
  OutlinedInput
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { ServerContext } from '../contexts/ServerContext';

const ServerConfig = () => {
  const { id } = useParams();
  const { getServer, updateServer } = useContext(ServerContext);
  
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [port, setPort] = useState(2001);
  const [maxPlayers, setMaxPlayers] = useState(32);
  const [steamAppId, setSteamAppId] = useState(1874880);
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  
  const fetchServer = useCallback(async () => {
    try {
      setLoading(true);
      const serverData = await getServer(id);
      setServer(serverData);
      
      // Update form state
      const { config } = serverData;
      setName(config.name || '');
      setPort(config.port || 2001);
      setMaxPlayers(config.maxPlayers || 32);
      setSteamAppId(config.steamAppId || 1874880);
      setPassword(config.password || '');
      setHasPassword(!!config.password);
      setAdminPassword(config.adminPassword || '');
      
      setError(null);
    } catch (err) {
      setError(`Failed to fetch server: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [id, getServer]);
  
  useEffect(() => {
    fetchServer();
  }, [fetchServer]);
  
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      
      const config = {
        name,
        port,
        maxPlayers,
        steamAppId,
        adminPassword,
        password: hasPassword ? password : ''
      };
      
      await updateServer(id, config);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setSaveError(`Failed to save configuration: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!server) {
    return (
      <Alert severity="error">
        Server not found or could not be loaded.
      </Alert>
    );
  }
  
  return (
    <Box className="pb-6">
      <Box className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <Button
            component={Link}
            to={`/servers/${id}`}
            startIcon={<ArrowBackIcon />}
            variant="text"
            className="mb-2"
          >
            Back to Server
          </Button>
          <Typography variant="h5" component="h1" gutterBottom>
            Server Settings
          </Typography>
        </div>
        
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      {saveError && (
        <Alert severity="error" className="mb-4">
          {saveError}
        </Alert>
      )}
      
      {saveSuccess && (
        <Alert severity="success" className="mb-4">
          Server settings saved successfully!
        </Alert>
      )}
      
      <Paper elevation={0} className="p-6 border rounded">
        <Typography variant="h6" className="mb-4">
          Basic Settings
        </Typography>
        <Divider className="mb-4" />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Server Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              helperText="The display name for your server"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Port"
              variant="outlined"
              type="number"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value) || '')}
              required
              inputProps={{ min: 1, max: 65535 }}
              helperText="The network port for your server"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Max Players"
              variant="outlined"
              type="number"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value) || '')}
              required
              inputProps={{ min: 1, max: 128 }}
              helperText="Maximum number of players allowed"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="steamAppId">Steam App ID</InputLabel>
              <OutlinedInput
                id="steamAppId"
                value={steamAppId}
                onChange={(e) => setSteamAppId(parseInt(e.target.value) || '')}
                endAdornment={
                  <InputAdornment position="end">
                    <Box component="span" className="text-xs px-2 py-1 bg-gray-100 rounded">
                      Arma Reforger: 1874880
                    </Box>
                  </InputAdornment>
                }
                label="Steam App ID"
              />
              <FormHelperText>
                The Steam App ID for the server software
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
        
        <Typography variant="h6" className="mt-8 mb-4">
          Security
        </Typography>
        <Divider className="mb-4" />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch 
                  checked={hasPassword} 
                  onChange={(e) => setHasPassword(e.target.checked)} 
                />
              }
              label="Require Password"
            />
          </Grid>
          
          {hasPassword && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Server Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="The password players need to join your server"
              />
            </Grid>
          )}
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Admin Password"
              variant="outlined"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              helperText="The password for server administration (required)"
            />
          </Grid>
        </Grid>
        
        {/* Advanced settings could go here in the future */}
      </Paper>
    </Box>
  );
};

export default ServerConfig;