const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const fs = require('fs-extra');
const logger = require('./utils/logger');
const steamCmdManager = require('./utils/steamCmdManager');
const fileManager = require('./utils/fileManager');
const serverManager = require('./utils/serverManager');
const fileUpload = require('express-fileupload');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io globally available for other modules to use
global.io = io;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  },
}));

// Socket.io for real-time server console
io.on('connection', (socket) => {
  logger.info('Client connected');

  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });

  // Subscribe to server console updates
  socket.on('subscribe-console', (serverId) => {
    serverManager.subscribeToConsole(serverId, (data) => {
      socket.emit('console-output', { serverId, data });
    });
  });
});

// Routes
app.use('/api/servers', require('./routes/servers'));
app.use('/api/files', require('./routes/files'));
app.use('/api/steam', require('./routes/steam'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  
  try {
    // Ensure required directories exist
    const requiredDirs = [
      './data', 
      './data/servers', 
      './data/steamcmd',
      path.join(__dirname, '../data/servers')
    ];
    
    for (const dir of requiredDirs) {
      await fs.ensureDir(dir);
      logger.info(`Ensured directory exists: ${dir}`);
    }
    
    // Load existing servers
    await serverManager.loadServers();
    
    // Check SteamCMD installation
    const steamCmdInstalled = await steamCmdManager.checkSteamCmdInstallation();
    if (!steamCmdInstalled) {
      logger.info('SteamCMD not found, installing...');
      await steamCmdManager.installSteamCmd();
    }
  } catch (err) {
    logger.error('Error during server initialization:', err);
  }
});