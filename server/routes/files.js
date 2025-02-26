const express = require('express');
const router = express.Router();
const fileManager = require('../utils/fileManager');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs-extra');

// Define the SERVERS_DIR constant
const SERVERS_DIR = path.join(__dirname, '../../data/servers');

// GET read file content - This route must be before the general file route
router.get('/:serverId/content/*', async (req, res) => {
  try {
    const serverId = req.params.serverId;
    const filePath = req.params[0];
    
    logger.info(`Reading file content for server ${serverId}, path: ${filePath}`);
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const serverPath = path.join(SERVERS_DIR, serverId);
    const fullPath = path.join(serverPath, filePath);
    
    logger.info(`Attempting to read file: ${fullPath}`);

    // Security checks
    if (!fullPath.startsWith(serverPath)) {
      logger.error(`Invalid path: ${fullPath}`);
      return res.status(403).json({ error: 'Invalid path' });
    }

    if (!await fs.pathExists(fullPath)) {
      logger.error(`File not found: ${fullPath}`);
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      logger.error(`Path is a directory: ${fullPath}`);
      return res.status(400).json({ error: 'Cannot read directory content' });
    }

    // Read file content
    const content = await fs.readFile(fullPath, 'utf8');
    
    logger.info(`Successfully read file. Content length: ${content.length}`);

    const response = {
      content: content,
      name: path.basename(filePath),
      path: filePath,
      size: stats.size,
      modified: stats.mtime
    };

    res.json(response);

  } catch (error) {
    logger.error(`Error reading file:`, error);
    res.status(500).json({ error: 'Failed to read file', details: error.message });
  }
});

// GET list files in a directory
router.get('/:serverId/*?', async (req, res) => {
  const serverId = req.params.serverId;
  const dirPath = req.params[0] || '';
  
  logger.info(`File listing requested for server ${serverId}, path: ${dirPath}`);
  logger.info(`Looking in directory: ${path.join(SERVERS_DIR, serverId)}`);
  
  try {
    // First check if server exists
    const serverPath = path.join(SERVERS_DIR, serverId);
    if (!await fs.pathExists(serverPath)) {
      return res.status(404).json({ 
        error: 'Server not found', 
        details: `No server found with ID: ${serverId}` 
      });
    }
    
    const files = await fileManager.listFiles(serverId, dirPath);
    res.json(files);
  } catch (error) {
    logger.error(`Error listing files:`, error);
    if (error.message.includes('not found')) {
      res.status(404).json({ error: 'Not found', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to list files', details: error.message });
    }
  }
});

// POST write file content
router.post('/:serverId/content/*', async (req, res) => {
  try {
    const serverId = req.params.serverId;
    const filePath = req.params[0];
    const { content } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    if (content === undefined) {
      return res.status(400).json({ error: 'File content is required' });
    }
    
    const result = await fileManager.writeFile(serverId, filePath, content);
    res.json(result);
  } catch (error) {
    logger.error(`Error writing file:`, error);
    res.status(500).json({ error: 'Failed to write file', details: error.message });
  }
});

// POST create directory
router.post('/:serverId/directory', async (req, res) => {
  try {
    const serverId = req.params.serverId;
    const { dirPath } = req.body;
    
    if (!dirPath) {
      return res.status(400).json({ error: 'Directory path is required' });
    }
    
    const result = await fileManager.createDirectory(serverId, dirPath);
    res.json(result);
  } catch (error) {
    logger.error(`Error creating directory:`, error);
    res.status(500).json({ error: 'Failed to create directory', details: error.message });
  }
});

// DELETE file or directory
router.delete('/:serverId/*', async (req, res) => {
  try {
    const serverId = req.params.serverId;
    const filePath = req.params[0];
    
    if (!filePath) {
      return res.status(400).json({ error: 'Path is required' });
    }
    
    const result = await fileManager.delete(serverId, filePath);
    res.json(result);
  } catch (error) {
    logger.error(`Error deleting path:`, error);
    res.status(500).json({ error: 'Failed to delete path', details: error.message });
  }
});

// Add this route to handle file uploads
router.post('/:serverId/upload', async (req, res) => {
  try {
    const serverId = req.params.serverId;
    const parentPath = req.query.path || '';
    
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }
    
    const uploadedFile = req.files.file;
    const filePath = path.join(parentPath, uploadedFile.name);
    
    // Move the file to the server's directory
    await fileManager.saveUploadedFile(serverId, filePath, uploadedFile);
    
    // Return the file info
    res.json({
      name: uploadedFile.name,
      path: filePath,
      isDirectory: false,
      size: uploadedFile.size,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error uploading file:`, error);
    res.status(500).json({ error: 'Failed to upload file', details: error.message });
  }
});

// Add rename endpoint
router.post('/:serverId/rename', async (req, res) => {
  try {
    const serverId = req.params.serverId;
    const { oldPath, newPath } = req.body;
    
    if (!oldPath || !newPath) {
      return res.status(400).json({ error: 'Both old and new paths are required' });
    }
    
    const oldFullPath = path.join(SERVERS_DIR, serverId, oldPath);
    const newFullPath = path.join(SERVERS_DIR, serverId, newPath);
    
    // Ensure paths are within server directory
    if (!oldFullPath.startsWith(path.join(SERVERS_DIR, serverId)) ||
        !newFullPath.startsWith(path.join(SERVERS_DIR, serverId))) {
      throw new Error('Invalid path');
    }
    
    await fs.move(oldFullPath, newFullPath);
    res.json({ success: true });
  } catch (error) {
    logger.error(`Error renaming file:`, error);
    res.status(500).json({ error: 'Failed to rename file', details: error.message });
  }
});

// Add copy/move endpoint
router.post('/:serverId/copy', async (req, res) => {
  try {
    const serverId = req.params.serverId;
    const { sourcePath, targetPath, move } = req.body;
    
    if (!sourcePath || !targetPath) {
      return res.status(400).json({ error: 'Both source and target paths are required' });
    }
    
    const sourceFullPath = path.join(SERVERS_DIR, serverId, sourcePath);
    const targetFullPath = path.join(SERVERS_DIR, serverId, targetPath);
    
    // Ensure paths are within server directory
    if (!sourceFullPath.startsWith(path.join(SERVERS_DIR, serverId)) ||
        !targetFullPath.startsWith(path.join(SERVERS_DIR, serverId))) {
      throw new Error('Invalid path');
    }
    
    if (move) {
      await fs.move(sourceFullPath, targetFullPath);
    } else {
      await fs.copy(sourceFullPath, targetFullPath);
    }
    
    res.json({ success: true });
  } catch (error) {
    logger.error(`Error copying/moving file:`, error);
    res.status(500).json({ error: 'Failed to copy/move file', details: error.message });
  }
});

module.exports = router;
