const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const logger = require('./logger');

// Constants
const SERVERS_DIR = path.join(__dirname, '../../data/servers');

// Active server processes
const runningServers = {};
// Console subscribers
const consoleSubscribers = {};

// Add this to track servers in memory
let servers = [];

const serverManager = {
  // List all servers
  listServers: async () => {
    try {
      await fs.ensureDir(SERVERS_DIR);
      
      const entries = await fs.readdir(SERVERS_DIR, { withFileTypes: true });
      const servers = [];
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const serverId = entry.name;
          try {
            const server = await serverManager.getServer(serverId);
            servers.push(server);
          } catch (err) {
            logger.warn(`Error loading server ${serverId}:`, err);
            // Add a minimal server object if we couldn't load the full config
            servers.push({
              id: serverId,
              config: { name: serverId },
              isRunning: !!runningServers[serverId],
              isInstalled: true,
              error: err.message
            });
          }
        }
      }
      
      return servers;
    } catch (err) {
      logger.error('Error listing servers:', err);
      throw err;
    }
  },

  // Get a specific server
  getServer: async (id) => {
    try {
      // First check if server exists in memory
      const server = servers.find(s => s.id === id);
      if (!server) {
        throw new Error(`Server ${id} not found`);
      }

      const serverPath = path.join(SERVERS_DIR, id);
      const configPath = path.join(serverPath, 'config.json');
      
      // Check if server is installed
      const isInstalled = await fs.pathExists(serverPath);
      
      // Load config if it exists
      let config = {};
      if (isInstalled && await fs.pathExists(configPath)) {
        config = await fs.readJson(configPath);
      }
      
      return {
        ...server,
        config,
        isInstalled,
        isRunning: !!runningServers[id]
      };
    } catch (err) {
      logger.error(`Error getting server ${id}:`, err);
      throw err;
    }
  },

  // Update server configuration
  updateServerConfig: async (id, config) => {
    try {
      const serverPath = path.join(SERVERS_DIR, id);
      const configPath = path.join(serverPath, 'config.json');
      
      await fs.ensureDir(serverPath);
      await fs.writeJson(configPath, config, { spaces: 2 });
      
      return config;
    } catch (err) {
      logger.error(`Error updating server ${id} config:`, err);
      throw err;
    }
  },

  // Delete a server
  deleteServer: async (id) => {
    try {
      const serverIndex = servers.findIndex(s => s.id === id);
      if (serverIndex === -1) {
        throw new Error(`Server ${id} not found`);
      }

      const server = servers[serverIndex];
      const serverPath = path.join(SERVERS_DIR, id);

      // Stop server if running
      if (server.isRunning) {
        await serverManager.stopServer(id);
      }

      // Remove server directory
      if (await fs.pathExists(serverPath)) {
        await fs.remove(serverPath);
      }

      // Remove from servers array
      servers.splice(serverIndex, 1);

      return { success: true };
    } catch (err) {
      logger.error(`Error deleting server ${id}:`, err);
      throw err;
    }
  },

  // Start the server
  startServer: async (id) => {
    try {
      // Check if already running
      if (runningServers[id]) {
        return { success: true, alreadyRunning: true };
      }
      
      const server = await serverManager.getServer(id);
      const serverPath = path.join(SERVERS_DIR, id);
      
      // Check if the server is installed
      if (!server.isInstalled) {
        throw new Error('Server is not installed. Please install it first.');
      }
      
      // Determine executable path based on platform
      const platform = os.platform();
      let executablePath;
      
      if (platform === 'win32') {
        executablePath = path.join(serverPath, 'ArmaReforgerServer.exe');
      } else {
        executablePath = path.join(serverPath, 'ArmaReforgerServer');
      }
      
      // Check if executable exists
      if (!(await fs.pathExists(executablePath))) {
        throw new Error('Server executable not found. Please check installation.');
      }
      
      // Prepare launch arguments
      const args = [
        '-config="serverConfig.json"',
        `-port=${server.config.port}`,
        `-maxPlayers=${server.config.maxPlayers}`
      ];
      
      // Add other config parameters as needed
      if (server.config.password) {
        args.push(`-password="${server.config.password}"`);
      }
      
      if (server.config.adminPassword) {
        args.push(`-adminPassword="${server.config.adminPassword}"`);
      }
      
      // Create server config file
      const serverConfigPath = path.join(serverPath, 'serverConfig.json');
      await fs.writeJson(serverConfigPath, {
        name: server.config.name,
        maxPlayers: server.config.maxPlayers,
        password: server.config.password || ''
      }, { spaces: 2 });
      
      logger.info(`Starting server ${id} with args:`, args.join(' '));
      
      // Spawn server process
      const serverProcess = spawn(executablePath, args, {
        cwd: serverPath,
        shell: true
      });
      
      // Store the process
      runningServers[id] = serverProcess;
      
      // Handle console output
      serverProcess.stdout.on('data', (data) => {
        const text = data.toString();
        logger.info(`[Server ${id}] ${text.trim()}`);
        
        // Send to subscribers
        if (consoleSubscribers[id]) {
          for (const callback of Object.values(consoleSubscribers[id])) {
            callback(text);
          }
        }
      });
      
      serverProcess.stderr.on('data', (data) => {
        const text = data.toString();
        logger.error(`[Server ${id}] ${text.trim()}`);
        
        // Send to subscribers
        if (consoleSubscribers[id]) {
          for (const callback of Object.values(consoleSubscribers[id])) {
            callback(`\x1b[31m${text}\x1b[0m`); // Red text for errors
          }
        }
      });
      
      // Handle process exit
      serverProcess.on('close', (code) => {
        logger.info(`Server ${id} exited with code ${code}`);
        
        // Notify subscribers
        if (consoleSubscribers[id]) {
          for (const callback of Object.values(consoleSubscribers[id])) {
            callback(`\x1b[33mServer process exited with code ${code}\x1b[0m\r\n`);
          }
        }
        
        // Clean up
        delete runningServers[id];
      });
      
      return { success: true };
    } catch (err) {
      logger.error(`Error starting server ${id}:`, err);
      throw err;
    }
  },

  // Stop the server
  stopServer: async (id) => {
    try {
      const serverProcess = runningServers[id];
      
      if (!serverProcess) {
        return { success: true, notRunning: true };
      }
      
      // Send message to subscribers
      if (consoleSubscribers[id]) {
        for (const callback of Object.values(consoleSubscribers[id])) {
          callback('\x1b[33mStopping server...\x1b[0m\r\n');
        }
      }
      
      // Kill the process
      serverProcess.kill();
      
      // Wait for process to exit
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!runningServers[id]) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        // Force kill after timeout
        setTimeout(() => {
          if (runningServers[id]) {
            try {
              process.kill(serverProcess.pid, 'SIGKILL');
            } catch (e) {
              logger.error(`Error force killing server ${id}:`, e);
            }
            delete runningServers[id];
            clearInterval(checkInterval);
            resolve();
          }
        }, 5000);
      });
      
      return { success: true };
    } catch (err) {
      logger.error(`Error stopping server ${id}:`, err);
      throw err;
    }
  },

  // Subscribe to server console
  subscribeToConsole: (serverId, callback) => {
    if (!consoleSubscribers[serverId]) {
      consoleSubscribers[serverId] = {};
    }
    
    const subId = Date.now().toString();
    consoleSubscribers[serverId][subId] = callback;
    
    // Return unsubscribe function
    return () => {
      if (consoleSubscribers[serverId]) {
        delete consoleSubscribers[serverId][subId];
        
        // Clean up if no subscribers left
        if (Object.keys(consoleSubscribers[serverId]).length === 0) {
          delete consoleSubscribers[serverId];
        }
      }
    };
  },

  // Get server stats (CPU, memory, etc.)
  getServerStats: async (id) => {
    const serverProcess = runningServers[id];
    
    if (!serverProcess) {
      return { running: false };
    }
    
    try {
      // This is just a placeholder - in a real implementation you would
      // get actual CPU and memory usage from the process
      return {
        running: true,
        uptime: Math.floor(process.uptime()), // Server uptime as proxy for now
        cpu: Math.random() * 20, // Fake CPU usage
        memory: Math.random() * 1024, // Fake memory usage in MB
        players: [] // Would contain actual player data
      };
    } catch (err) {
      logger.error(`Error getting stats for server ${id}:`, err);
      return { running: true, error: err.message };
    }
  },

  // Create a new server
  createServer: async (serverData) => {
    try {
      await fs.ensureDir(SERVERS_DIR);
      
      const serverId = serverData.id;
      const serverPath = path.join(SERVERS_DIR, serverId);
      
      // Create server directory and structure
      await fs.ensureDir(serverPath);
      await fs.ensureDir(path.join(serverPath, 'config'));
      await fs.ensureDir(path.join(serverPath, 'mods'));
      await fs.ensureDir(path.join(serverPath, 'logs'));
      
      // Create initial config file
      const config = {
        name: serverData.name,
        port: serverData.port || 2302,
        maxPlayers: serverData.maxPlayers || 32,
        steamAppId: serverData.steamAppId || '1874880'
      };
      
      await fs.writeJson(path.join(serverPath, 'config.json'), config, { spaces: 2 });
      
      // Create server object
      const server = {
        id: serverId,
        ...config,
        isInstalled: false,
        isRunning: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add to servers array
      servers.push(server);
      
      return server;
    } catch (err) {
      logger.error('Error creating server:', err);
      throw err;
    }
  },

  // Install a server
  installServer: async (id) => {
    try {
      const server = servers.find(s => s.id === id);
      if (!server) {
        throw new Error(`Server ${id} not found`);
      }

      const serverPath = path.join(SERVERS_DIR, id);
      
      // Ensure server directory exists
      await fs.ensureDir(serverPath);
      
      // Rest of your installation code...
    } catch (err) {
      logger.error('Error installing server:', err);
      throw err;
    }
  },

  // Add this method
  loadServers: async () => {
    try {
      await fs.ensureDir(SERVERS_DIR);
      
      const entries = await fs.readdir(SERVERS_DIR, { withFileTypes: true });
      servers = await Promise.all(entries
        .filter(entry => entry.isDirectory())
        .map(async entry => {
          const id = entry.name;
          const configPath = path.join(SERVERS_DIR, id, 'config.json');
          let config = {};
          
          if (await fs.pathExists(configPath)) {
            config = await fs.readJson(configPath);
          }
          
          return {
            id,
            ...config,
            isInstalled: true,
            isRunning: !!runningServers[id]
          };
        }));
        
      logger.info(`Loaded ${servers.length} servers`);
    } catch (err) {
      logger.error('Error loading servers:', err);
      throw err;
    }
  }
};

module.exports = serverManager; 