const express = require('express');
const router = express.Router();
const serverManager = require('../utils/serverManager');
const steamCmdManager = require('../utils/steamCmdManager');
const logger = require('../utils/logger');

// GET all servers
router.get('/', async (req, res) => {
  try {
    const servers = await serverManager.listServers();
    res.json(servers);
  } catch (error) {
    logger.error('Error getting servers:', error);
    res.status(500).json({ error: 'Failed to get servers', details: error.message });
  }
});

// GET a specific server
router.get('/:id', async (req, res) => {
  try {
    const server = await serverManager.getServer(req.params.id);
    res.json(server);
  } catch (error) {
    logger.error(`Error getting server ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get server', details: error.message });
  }
});

// POST create a new server
router.post('/', async (req, res) => {
  try {
    const { id, ...config } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Server ID is required' });
    }
    
    const updatedConfig = await serverManager.updateServerConfig(id, config);
    res.json({ id, config: updatedConfig });
  } catch (error) {
    logger.error(`Error creating server:`, error);
    res.status(500).json({ error: 'Failed to create server', details: error.message });
  }
});

// PUT update server configuration
router.put('/:id', async (req, res) => {
  try {
    const updatedConfig = await serverManager.updateServerConfig(req.params.id, req.body);
    res.json({ id: req.params.id, config: updatedConfig });
  } catch (error) {
    logger.error(`Error updating server ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update server', details: error.message });
  }
});

// POST install/update server
router.post('/:id/install', async (req, res) => {
  try {
    const { id } = req.params;
    const serverData = await serverManager.getServer(id);
    const appId = serverData.config.steamAppId || 1874880; // Use configured App ID or default
    
    const result = await steamCmdManager.installServer(id, appId);
    res.json(result);
  } catch (error) {
    logger.error(`Error installing server ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to install server', details: error.message });
  }
});

// POST start server
router.post('/:id/start', async (req, res) => {
  try {
    const result = await serverManager.startServer(req.params.id);
    res.json(result);
  } catch (error) {
    logger.error(`Error starting server ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to start server', details: error.message });
  }
});

// POST stop server
router.post('/:id/stop', async (req, res) => {
  try {
    const result = await serverManager.stopServer(req.params.id);
    res.json(result);
  } catch (error) {
    logger.error(`Error stopping server ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to stop server', details: error.message });
  }
});

// DELETE server
router.delete('/:id', async (req, res) => {
  try {
    const result = await serverManager.deleteServer(req.params.id);
    res.json(result);
  } catch (error) {
    logger.error(`Error deleting server ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete server', details: error.message });
  }
});

// GET server stats
router.get('/:id/stats', async (req, res) => {
  try {
    const stats = await serverManager.getServerStats(req.params.id);
    res.json(stats);
  } catch (error) {
    logger.error(`Error getting stats for server ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get server stats', details: error.message });
  }
});

module.exports = router;
