// Mock API service for development when backend is not available

const STORAGE_KEY = 'mockServers';

const getMockServers = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    console.error('Error parsing mock servers from localStorage', e);
    return [];
  }
};

const saveMockServers = (servers) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
};

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const mockApiService = {
  // Get all servers
  getServers: async () => {
    await delay();
    return getMockServers();
  },
  
  // Create a new server
  createServer: async (serverData) => {
    await delay();
    
    // Make sure we get existing servers properly
    const servers = getMockServers();
    
    // Check if server already exists
    if (servers.some(s => s.id === serverData.id)) {
      throw new Error(`Server with ID '${serverData.id}' already exists`);
    }
    
    // Create the new server with defaults for missing fields
    const newServer = {
      id: serverData.id,
      name: serverData.name || 'New Server',
      port: serverData.port || 2001,
      maxPlayers: serverData.maxPlayers || 32,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      players: [],
      isRunning: false,
      isInstalled: false,
      ...serverData  // This will override defaults with provided values
    };
    
    // Add to servers array
    servers.push(newServer);
    
    // Save to localStorage
    saveMockServers(servers);
    console.log('Created mock server:', newServer);
    console.log('All servers:', servers);
    
    return newServer;
  },
  
  // Start a server
  startServer: async (id) => {
    await delay();
    const servers = getMockServers();
    const serverIndex = servers.findIndex(s => s.id === id);
    
    if (serverIndex === -1) {
      throw new Error(`Server with ID '${id}' not found`);
    }
    
    // Only start if it's installed
    if (!servers[serverIndex].isInstalled) {
      throw new Error(`Server must be installed before starting`);
    }
    
    servers[serverIndex].isRunning = true;
    servers[serverIndex].cpuUsage = Math.floor(Math.random() * 20) + 5; // 5-25%
    servers[serverIndex].memoryUsage = Math.floor(Math.random() * 40) + 10; // 10-50%
    saveMockServers(servers);
    
    return servers[serverIndex];
  },
  
  // Stop a server
  stopServer: async (id) => {
    await delay();
    const servers = getMockServers();
    const serverIndex = servers.findIndex(s => s.id === id);
    
    if (serverIndex === -1) {
      throw new Error(`Server with ID '${id}' not found`);
    }
    
    servers[serverIndex].isRunning = false;
    servers[serverIndex].cpuUsage = 0;
    servers[serverIndex].memoryUsage = 0;
    servers[serverIndex].uptime = 0;
    servers[serverIndex].players = [];
    saveMockServers(servers);
    
    return servers[serverIndex];
  },
  
  // Delete a server
  deleteServer: async (id) => {
    await delay();
    const servers = getMockServers();
    const filteredServers = servers.filter(s => s.id !== id);
    
    if (filteredServers.length === servers.length) {
      throw new Error(`Server with ID '${id}' not found`);
    }
    
    saveMockServers(filteredServers);
    return { success: true, message: `Server '${id}' deleted successfully` };
  },
  
  // Install a server
  installServer: async (id) => {
    console.log('Mock API: Installing server', id);
    
    // Use the existing helper function for consistency
    const servers = getMockServers();
    const serverIndex = servers.findIndex(s => s.id === id);
    
    if (serverIndex === -1) {
      console.error('Mock API: Server not found', id);
      // Add more debugging info
      console.log('Available servers:', servers);
      console.log('Looking for ID:', id);
      throw new Error('Server not found');
    }
    
    const server = servers[serverIndex];
    
    // Progress tracking
    let progress = 0;
    
    // Helper to update progress with a task name
    const updateProgress = (newProgress, task) => {
      progress = newProgress;
      // Use the socket.io emit function if available, otherwise fall back to console log
      if (window.socket?.emit) {
        window.socket.emit('server-install-progress', {
          serverId: id,
          progress,
          task,
          error: null
        });
      } else {
        // Fallback to SocketContext's pattern
        const event = new CustomEvent('server-install-progress', {
          detail: {
            serverId: id,
            progress,
            task,
            error: null
          }
        });
        window.dispatchEvent(event);
        console.log('Install progress:', id, progress, task);
      }
    };
    
    // Simulate installation progress
    // Stage 1: Initialize
    updateProgress(5, 'Initializing installation environment');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Stage 2: Download
    updateProgress(10, 'Connecting to Steam servers');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    updateProgress(15, 'Downloading server files');
    
    // Simulate download progress in smaller increments
    for (let i = 20; i <= 85; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 800));
      updateProgress(i, `Downloading game files (${i}%)`);
    }
    
    // Stage 3: Extract and install
    updateProgress(90, 'Extracting files');
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    updateProgress(95, 'Configuring server');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateProgress(100, 'Installation complete');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update server in localStorage
    const updatedServer = {
      ...server,
      isInstalled: true,
      diskUsage: Math.floor(Math.random() * 30) + 20 // Random disk usage between 20-50%
    };
    
    servers[serverIndex] = updatedServer;
    saveMockServers(servers);
    
    // Return the updated server
    return updatedServer;
  },
  
  // Get a single server
  getServer: async (id) => {
    await delay();
    const servers = getMockServers();
    const server = servers.find(s => s.id === id);
    
    if (!server) {
      throw new Error(`Server with ID '${id}' not found`);
    }
    
    return server;
  }
};

export default mockApiService; 