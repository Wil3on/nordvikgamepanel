const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');

// Constants
const SERVERS_DIR = path.join(__dirname, '../../data/servers');

const fileManager = {
  // List files in a directory
  listFiles: async (serverId, dirPath = '') => {
    try {
      const serverPath = path.join(SERVERS_DIR, serverId);
      
      // Check if server directory exists
      if (!await fs.pathExists(serverPath)) {
        throw new Error(`Server directory not found for ID: ${serverId}`);
      }
      
      const targetPath = path.join(serverPath, dirPath);
      
      // Ensure path is within server directory (prevent directory traversal)
      if (!targetPath.startsWith(serverPath)) {
        throw new Error('Invalid path');
      }
      
      // Create directory if it doesn't exist
      await fs.ensureDir(targetPath);
      
      const entries = await fs.readdir(targetPath, { withFileTypes: true });
      const files = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(targetPath, entry.name);
        const stats = await fs.stat(fullPath);
        const relativePath = path.relative(serverPath, fullPath);
        
        return {
          id: relativePath, // Required by react-file-manager
          name: entry.name,
          isDirectory: entry.isDirectory(),
          path: relativePath.replace(/\\/g, '/'), // Use forward slashes for paths
          size: entry.isDirectory() ? 0 : stats.size,
          modified: stats.mtime,
          modifiedAt: stats.mtime.toISOString(),
          createdAt: stats.birthtime.toISOString(),
          extension: entry.isDirectory() ? null : path.extname(entry.name).slice(1)
        };
      }));
      
      // Sort directories first, then files alphabetically
      files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      return files;
    } catch (err) {
      logger.error(`Error listing files for server ${serverId} in path ${dirPath}:`, err);
      throw err;
    }
  },

  // Read file content
  readFile: async (serverId, filePath) => {
    try {
      const serverPath = path.join(SERVERS_DIR, serverId);
      
      // Check if server exists
      if (!await fs.pathExists(serverPath)) {
        throw new Error(`Server directory not found for ID: ${serverId}`);
      }
      
      const fullPath = path.join(serverPath, filePath);
      
      // Ensure path is within server directory
      if (!fullPath.startsWith(serverPath)) {
        throw new Error('Invalid path');
      }
      
      // Check if file exists
      if (!await fs.pathExists(fullPath)) {
        throw new Error(`File ${filePath} does not exist`);
      }
      
      // Check if it's a directory
      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
        throw new Error('Path points to a directory');
      }
      
      // Read file content
      let content = '';
      try {
        const buffer = await fs.readFile(fullPath);
        content = buffer.toString('utf8');
        logger.info(`Successfully read file ${filePath}, content length: ${content.length}`);
      } catch (err) {
        logger.error(`Error reading file as UTF-8: ${err.message}`);
        content = ''; // Provide empty content for non-text files
      }
      
      const result = {
        content,
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        isDirectory: false
      };

      logger.info(`Returning file data:`, {
        name: result.name,
        path: result.path,
        size: result.size,
        contentLength: result.content.length
      });

      return result;
    } catch (err) {
      logger.error(`Error reading file ${filePath} for server ${serverId}:`, err);
      throw err;
    }
  },

  // Write file content
  writeFile: async (serverId, filePath, content) => {
    try {
      const serverPath = path.join(SERVERS_DIR, serverId);
      const targetPath = path.join(serverPath, filePath);
      
      // Ensure path is within server directory (prevent directory traversal)
      if (!targetPath.startsWith(serverPath)) {
        throw new Error('Invalid path');
      }
      
      // Ensure parent directory exists
      await fs.ensureDir(path.dirname(targetPath));
      
      await fs.writeFile(targetPath, content, 'utf8');
      
      const stats = await fs.stat(targetPath);
      
      return {
        success: true,
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        modified: stats.mtime
      };
    } catch (err) {
      logger.error(`Error writing file ${filePath} for server ${serverId}:`, err);
      throw err;
    }
  },

  // Create a directory
  createDirectory: async (serverId, dirPath) => {
    try {
      const serverPath = path.join(SERVERS_DIR, serverId);
      const targetPath = path.join(serverPath, dirPath);
      
      // Ensure path is within server directory (prevent directory traversal)
      if (!targetPath.startsWith(serverPath)) {
        throw new Error('Invalid path');
      }
      
      await fs.ensureDir(targetPath);
      
      const stats = await fs.stat(targetPath);
      
      return {
        success: true,
        name: path.basename(dirPath),
        path: dirPath,
        isDirectory: true,
        modified: stats.mtime
      };
    } catch (err) {
      logger.error(`Error creating directory ${dirPath} for server ${serverId}:`, err);
      throw err;
    }
  },

  // Delete a file or directory
  delete: async (serverId, filePath) => {
    try {
      const serverPath = path.join(SERVERS_DIR, serverId);
      const targetPath = path.join(serverPath, filePath);
      
      // Ensure path is within server directory (prevent directory traversal)
      if (!targetPath.startsWith(serverPath)) {
        throw new Error('Invalid path');
      }
      
      // Don't allow deleting the server directory itself
      if (targetPath === serverPath) {
        throw new Error('Cannot delete the server root directory');
      }
      
      if (!(await fs.pathExists(targetPath))) {
        throw new Error(`Path ${filePath} does not exist`);
      }
      
      await fs.remove(targetPath);
      
      return { success: true };
    } catch (err) {
      logger.error(`Error deleting path ${filePath} for server ${serverId}:`, err);
      throw err;
    }
  },

  // Add this method to handle file uploads
  saveUploadedFile: async (serverId, filePath, uploadedFile) => {
    try {
      const serverPath = path.join(SERVERS_DIR, serverId);
      const targetPath = path.join(serverPath, filePath);
      
      // Ensure path is within server directory (prevent directory traversal)
      if (!targetPath.startsWith(serverPath)) {
        throw new Error('Invalid path');
      }
      
      // Create parent directories if they don't exist
      await fs.ensureDir(path.dirname(targetPath));
      
      // Move the uploaded file to the target path
      await uploadedFile.mv(targetPath);
      
      return {
        name: path.basename(filePath),
        path: filePath,
        isDirectory: false,
        size: uploadedFile.size,
        modified: new Date()
      };
    } catch (err) {
      logger.error(`Error saving uploaded file ${filePath} for server ${serverId}:`, err);
      throw err;
    }
  }
};

// Example of the correct file format
const formatFile = (entry, relativePath) => ({
  name: entry.name,
  isDirectory: entry.isDirectory(),
  path: relativePath,
  updatedAt: entry.mtime.toISOString(),
  size: entry.isDirectory() ? null : entry.size
});

module.exports = fileManager;
