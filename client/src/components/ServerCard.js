import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardActions, 
  Typography, 
  Button, 
  Chip, 
  Grid,
  IconButton,
  Tooltip,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Divider,
  Paper
} from '@mui/material';
import { 
  PlayArrow as PlayIcon, 
  Stop as StopIcon, 
  Delete as DeleteIcon, 
  CloudDownload as UpdateIcon, 
  Settings as SettingsIcon,
  Storage as StorageIcon,
  MoreVert as MoreVertIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Terminal as TerminalIcon
} from '@mui/icons-material';
import { SocketContext } from '../contexts/SocketContext';
import ServerInstallProgress from './ServerInstallProgress';
import { Link } from 'react-router-dom';

const ServerCard = ({ server, onStart, onStop, onDelete, onInstall }) => {
  const { installProgress, resetInstallProgress } = useContext(SocketContext);
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = React.useState(null);

  if (!server) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2, height: '100%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Invalid server data</Typography>
      </Paper>
    );
  }

  const { id, name, isRunning, isInstalled, cpuUsage, memoryUsage, port, players = [] } = server;
  
  const serverProgress = installProgress[id];
  const isInstalling = serverProgress && serverProgress.progress < 100 && !serverProgress.error;
  
  const handleCardClick = () => {
    navigate(`/servers/${id}`);
  };
  
  const handleStart = (e) => {
    e.stopPropagation(); // Prevent card click
    onStart(id);
  };
  
  const handleStop = (e) => {
    e.stopPropagation(); // Prevent card click
    onStop(id);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card click
    if (window.confirm(`Are you sure you want to delete server "${name}"?`)) {
      onDelete(id);
    }
  };
  
  const handleInstall = (e) => {
    e.stopPropagation(); // Prevent card click
    onInstall(id);
  };
  
  const handleSettings = (e) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/servers/${id}/config`);
  };
  
  const handleCloseProgress = () => {
    resetInstallProgress(id);
  };
  
  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <Card className="server-card" sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: isRunning 
          ? 'linear-gradient(to right, #10b981, #34d399)' 
          : 'linear-gradient(to right, #6b7280, #9ca3af)',
        zIndex: 1
      }
    }}>
      <CardHeader
        title={
          <Typography 
            variant="h6" 
            component={Link}
            to={`/servers/${server.id}`}
            sx={{ 
              fontWeight: 600,
              fontSize: '1.125rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'none',
                color: 'primary.dark'
              },
              transition: 'color 0.2s ease'
            }}
          >
            {server.config?.name || server.name || `Server ${server.id}`}
          </Typography>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.875rem',
                mr: 1 
              }}
            >
              ID: {server.id}
            </Typography>
            <Chip
              label={server.isRunning ? 'Running' : 'Stopped'}
              color={server.isRunning ? 'success' : 'default'}
              size="small"
              sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0 } }}
            />
          </Box>
        }
        sx={{
          pb: 0,
          '& .MuiCardHeader-content': { minWidth: 0 }
        }}
      />
      <CardContent sx={{ flexGrow: 1, pb: 1, position: 'relative', zIndex: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              mr: 1.5, 
              p: 0.8, 
              borderRadius: '8px', 
              bgcolor: 'rgba(37, 99, 235, 0.1)', 
              display: 'flex' 
            }}>
              <StorageIcon color="primary" fontSize="small" />
            </Box>
            <Typography variant="h6" component={Link} to={`/servers/${id}`} sx={{ 
              color: 'text.primary', 
              textDecoration: 'none',
              '&:hover': { 
                textDecoration: 'none',
                color: 'primary.main'
              },
              transition: 'color 0.2s ease'
            }}>
              {name}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleMenuOpen} sx={{
            bgcolor: 'rgba(37, 99, 235, 0.05)',
            '&:hover': {
              bgcolor: 'rgba(37, 99, 235, 0.1)',
            }
          }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Chip 
            label={isRunning ? 'Running' : 'Stopped'} 
            size="small" 
            color={isRunning ? 'success' : 'default'}
            icon={isRunning ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
            sx={{ mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            Port: {port}
          </Typography>
        </Box>
        
        {isInstalling && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Installing server...
            </Typography>
            <LinearProgress 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                '.MuiLinearProgress-bar': {
                  background: 'linear-gradient(to right, #3b82f6, #2563eb)'
                }
              }} 
            />
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        {isRunning ? (
          <Button 
            size="small" 
            startIcon={<StopIcon />} 
            onClick={onStop}
            variant="outlined"
            color="error"
            sx={{
              borderColor: 'rgba(239, 68, 68, 0.3)',
              '&:hover': {
                borderColor: 'rgba(239, 68, 68, 0.5)',
                backgroundColor: 'rgba(239, 68, 68, 0.05)'
              }
            }}
          >
            Stop
          </Button>
        ) : (
          <Button 
            size="small" 
            startIcon={<PlayIcon />} 
            onClick={onStart}
            variant="contained"
            color="primary"
            disabled={!isInstalled}
            sx={{
              boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.4)',
            }}
          >
            Start
          </Button>
        )}
        
        <Button 
          size="small" 
          startIcon={<TerminalIcon />} 
          component={Link}
          to={`/servers/${id}/console`}
          sx={{ 
            ml: 1,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.05)',
              color: 'text.primary'
            }
          }}
        >
          Console
        </Button>
      </CardActions>
      
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            border: '1px solid rgba(59, 130, 246, 0.1)',
            boxShadow: '0 10px 40px rgba(2, 6, 23, 0.5), 0 0 0 1px rgba(30, 64, 175, 0.1)',
            backgroundImage: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <MenuItem component={Link} to={`/servers/${id}/files`} onClick={handleMenuClose} sx={{
          borderRadius: 1,
          mx: 0.5,
          my: 0.25
        }}>
          <ListItemIcon>
            <StorageIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Files</ListItemText>
        </MenuItem>
        
        <MenuItem component={Link} to={`/servers/${id}/config`} onClick={handleMenuClose} sx={{
          borderRadius: 1,
          mx: 0.5,
          my: 0.25
        }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        
        {!isInstalled && (
          <MenuItem onClick={() => { onInstall(); handleMenuClose(); }} sx={{
            borderRadius: 1,
            mx: 0.5,
            my: 0.25
          }}>
            <ListItemIcon>
              <UpdateIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Install Server</ListItemText>
          </MenuItem>
        )}
        
        <Divider sx={{ my: 1, mx: 1 }} />
        
        <MenuItem onClick={() => { onDelete(); handleMenuClose(); }} sx={{ 
          color: 'error.main',
          borderRadius: 1,
          mx: 0.5,
          my: 0.25,
          '&:hover': {
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
          }
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Server</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ServerCard;