const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

module.exports = function(io, servers, saveServers) {
  const router = express.Router();
  
  // GET all servers
  router.get('/servers', (req, res) => {
    res.json(servers);
  });
  
  // GET a specific server
  router.get('/servers/:id', (req, res) => {
    const server = servers.find(s => s.id === req.params.id);
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }
    res.json(server);
  });
  
  // CREATE a new server
  router.post('/servers', (req, res) => {
    const { id, name, port, maxPlayers, steamAppId } = req.body;
    
    // Validate required fields
    if (!id || !name) {
      return res.status(400).json({ message: 'Server ID and name are required' });
    }
    
    // Check for duplicate ID
    if (servers.some(server => server.id === id)) {
      return res.status(409).json({ message: `Server with ID '${id}' already exists` });
    }
    
    // Create new server
    const newServer = {
      id,
      name,
      port: port || 2001,
      maxPlayers: maxPlayers || 32,
      steamAppId: steamAppId || 1874880,
      isRunning: false,
      isInstalled: false,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      uptime: 0,
      players: [],
      createdAt: new Date().toISOString()
    };
    
    servers.push(newServer);
    saveServers();
    
    res.status(201).json(newServer);
  });
  
  // UPDATE a server
  router.put('/servers/:id', (req, res) => {
    const { name, port, maxPlayers } = req.body;
    const serverIndex = servers.findIndex(s => s.id === req.params.id);
    
    if (serverIndex === -1) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    // Update only allowed fields
    if (name) servers[serverIndex].name = name;
    if (port) servers[serverIndex].port = port;
    if (maxPlayers) servers[serverIndex].maxPlayers = maxPlayers;
    
    saveServers();
    res.json(servers[serverIndex]);
  });
  
  // DELETE a server
  router.delete('/servers/:id', (req, res) => {
    const initialLength = servers.length;
    servers = servers.filter(s => s.id !== req.params.id);
    
    if (servers.length === initialLength) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    saveServers();
    res.json({ message: `Server '${req.params.id}' deleted successfully` });
  });
  
  // START a server
  router.post('/servers/:id/start', (req, res) => {
    const serverIndex = servers.findIndex(s => s.id === req.params.id);
    
    if (serverIndex === -1) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    if (!servers[serverIndex].isInstalled) {
      return res.status(400).json({ message: 'Server must be installed before starting' });
    }
    
    // Simulate starting the server
    servers[serverIndex].isRunning = true;
    servers[serverIndex].cpuUsage = Math.floor(Math.random() * 20) + 5; // 5-25%
    servers[serverIndex].memoryUsage = Math.floor(Math.random() * 40) + 10; // 10-50%
    
    // Emit some fake console messages over socket.io
    const serverId = req.params.id;
    const interval = setInterval(() => {
      if (servers.find(s => s.id === serverId)?.isRunning) {
        io.emit('serverConsole', {
          id: serverId,
          message: `[${new Date().toISOString()}] Server running, players: ${Math.floor(Math.random() * 10)}/${servers[serverIndex].maxPlayers}`,
          type: 'info'
        });
      } else {
        clearInterval(interval);
      }
    }, 5000);
    
    saveServers();
    res.json(servers[serverIndex]);
  });
  
  // STOP a server
  router.post('/servers/:id/stop', (req, res) => {
    const serverIndex = servers.findIndex(s => s.id === req.params.id);
    
    if (serverIndex === -1) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    servers[serverIndex].isRunning = false;
    servers[serverIndex].cpuUsage = 0;
    servers[serverIndex].memoryUsage = 0;
    servers[serverIndex].uptime = 0;
    servers[serverIndex].players = [];
    
    // Emit shutdown message
    io.emit('serverConsole', {
      id: req.params.id,
      message: `[${new Date().toISOString()}] Server shutting down...`,
      type: 'info'
    });
    
    saveServers();
    res.json(servers[serverIndex]);
  });
  
  // INSTALL a server
  router.post('/servers/:id/install', async (req, res) => {
    const serverIndex = servers.findIndex(s => s.id === req.params.id);
    
    if (serverIndex === -1) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    const serverId = req.params.id;
    
    // Respond immediately to not block
    res.json({ 
      id: serverId,
      message: 'Installation started',
      status: 'started'
    });
    
    // Simulate a lengthy installation process with progress updates
    let progress = 0;
    const updateProgress = (newProgress, task) => {
      progress = newProgress;
      io.emit('serverInstallProgress', {
        id: serverId,
        progress,
        task,
        error: null
      });
    };
    
    // Stage 1: Initialize
    updateProgress(5, 'Initializing SteamCMD');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Stage 2: Authenticate
    updateProgress(15, 'Authenticating with Steam');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Stage 3: Download (main stage, takes longest)
    updateProgress(20, 'Starting download');
    
    // Simulate download progress
    for (let i = 20; i < 90; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateProgress(i, `Downloading server files (${i}%)`);
    }
    
    // Stage 4: Verify and finalize
    updateProgress(90, 'Verifying installation');
    await new Promise(resolve => setTimeout(resolve, 2000));
    updateProgress(95, 'Installing server components');
    await new Promise(resolve => setTimeout(resolve, 2000));
    updateProgress(100, 'Installation complete');
    
    // Update server object once installation is complete
    servers[serverIndex].isInstalled = true;
    servers[serverIndex].diskUsage = Math.floor(Math.random() * 50) + 20; // 20-70%
    saveServers();
  });
  
  // Get server stats (CPU, memory, etc.)
  router.get('/servers/:id/stats', (req, res) => {
    const server = servers.find(s => s.id === req.params.id);
    
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    if (!server.isRunning) {
      return res.status(400).json({ message: 'Server is not running' });
    }
    
    // Generate some random stats
    const stats = {
      cpu: parseFloat((Math.random() * 30 + 5).toFixed(1)),
      memory: Math.floor(Math.random() * 1000 + 200),
      uptime: Math.floor(Math.random() * 3600),
      players: [],
      pid: Math.floor(Math.random() * 10000 + 1000)
    };
    
    res.json(stats);
  });
  
  return router;
}; 