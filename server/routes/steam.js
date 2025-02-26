const express = require('express');
const router = express.Router();
const steamCmdManager = require('../utils/steamCmdManager');
const logger = require('../utils/logger');

// GET check SteamCMD installation
router.get('/status', async (req, res) => {
  try {
    const installed = await steamCmdManager.checkSteamCmdInstallation();
    res.json({ installed });
  } catch (error) {
    logger.error('Error checking SteamCMD installation:', error);
    res.status(500).json({ error: 'Failed to check SteamCMD installation', details: error.message });
  }
});

// POST install SteamCMD
router.post('/install', async (req, res) => {
  try {
    const result = await steamCmdManager.installSteamCmd();
    res.json({ success: result });
  } catch (error) {
    logger.error('Error installing SteamCMD:', error);
    res.status(500).json({ error: 'Failed to install SteamCMD', details: error.message });
  }
});

module.exports = router;
