import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Drawer, 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Tooltip,
  Avatar,
  Divider,
  useTheme,
  styled,
  Badge,
  Menu,
  MenuItem,
  alpha
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon
} from '@mui/icons-material';
import ConnectionStatusBadge from './ConnectionStatusBadge';

const DRAWER_WIDTH = 240;
const CLOSED_DRAWER_WIDTH = 70;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  zIndex: theme.zIndex.drawer + 1,
  background: theme.palette.background.default,
  borderBottom: '1px solid rgba(30, 41, 59, 0.2)',
}));

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  flexShrink: 0,
  whiteSpace: 'nowrap',
  width: open ? DRAWER_WIDTH : CLOSED_DRAWER_WIDTH,
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    background: '#0a1428',
    borderRight: 'none',
    width: open ? DRAWER_WIDTH : CLOSED_DRAWER_WIDTH,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  },
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  paddingLeft: 16,
  paddingRight: 16,
  marginBottom: 8,
  borderRadius: 8,
  ...(selected && {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.25),
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main
    },
    '& .MuiListItemText-primary': {
      color: theme.palette.primary.main,
      fontWeight: 600
    }
  })
}));

const Navigation = ({ drawerOpen, toggleDrawer, isMobile }) => {
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'All Servers', icon: <StorageIcon />, path: '/servers' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const isSelected = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: drawerOpen ? 'space-between' : 'center',
          px: 2,
          py: 2.5,
        }}
      >
        {drawerOpen && (
          <Typography variant="h6" color="primary" sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            letterSpacing: '-0.025em',
            display: 'flex',
            alignItems: 'center'
          }}>
            Nordvik Panel
          </Typography>
        )}
        
        {!isMobile && (
          <IconButton onClick={toggleDrawer} size="small" color="primary"
            sx={{ 
              background: alpha(theme.palette.primary.main, 0.1),
              transition: 'transform 0.2s',
              transform: drawerOpen ? 'rotate(0deg)' : 'rotate(180deg)',
              '&:hover': { background: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ opacity: 0.1, mx: 2, mb: 2 }} />
      
      <List sx={{ px: 2 }}>
        {navigationItems.map((item) => {
          const selected = isSelected(item.path);
          
          return (
            <Tooltip 
              key={item.text} 
              title={!drawerOpen ? item.text : ''} 
              placement="right"
              arrow
            >
              <StyledListItem
                component={Link}
                to={item.path}
                selected={selected}
                button
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  justifyContent: drawerOpen ? 'initial' : 'center',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: drawerOpen ? 2 : 'auto',
                    justifyContent: 'center',
                    color: selected ? 'primary.main' : 'text.secondary'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: 14, 
                      color: selected ? 'primary.main' : 'text.primary',
                      fontWeight: selected ? 600 : 500
                    }} 
                  />
                )}
              </StyledListItem>
            </Tooltip>
          );
        })}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Box sx={{ p: 2 }}>
        {drawerOpen ? (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 1.5, 
              borderRadius: 2,
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              mb: 1
            }}
          >
            <Avatar 
              sx={{ 
                width: 38, 
                height: 38, 
                bgcolor: 'primary.main',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              A
            </Avatar>
            <Box sx={{ ml: 1.5 }}>
              <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Admin
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Administrator
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Admin" placement="right" arrow>
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: 'primary.main',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                A
              </Avatar>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ConnectionStatusBadge />
            
            <Tooltip title="Add new server">
              <IconButton 
                color="primary" 
                component={Link} 
                to="/?newServer=true"
                sx={{ 
                  mr: 1,
                  background: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { background: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton color="inherit" sx={{ mr: 1 }}>
                <Badge badgeContent={0} color="primary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                A
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              PaperProps={{
                elevation: 1,
                sx: {
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  border: '1px solid rgba(30, 41, 59, 0.2)',
                  overflow: 'visible',
                  mt: 1.5,
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: theme.palette.background.paper,
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                    borderLeft: '1px solid rgba(30, 41, 59, 0.2)',
                    borderTop: '1px solid rgba(30, 41, 59, 0.2)',
                  },
                },
              }}
            >
              <MenuItem onClick={handleClose} sx={{ minWidth: 180 }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </StyledAppBar>
      
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              width: DRAWER_WIDTH, 
              boxSizing: 'border-box',
              backgroundColor: '#0a1428',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <StyledDrawer
          variant="permanent"
          open={drawerOpen}
        >
          {drawerContent}
        </StyledDrawer>
      )}
    </>
  );
};

export default Navigation;