const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory "database" for development
let servers = [];
const DATA_FILE = path.join(__dirname, 'data', 'servers.json');

// Load initial data
async function loadServers() {
  try {
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    const data = await fs.readFile(DATA_FILE, 'utf8');
    servers = JSON.parse(data);
    console.log('Loaded servers from file');
  } catch (err) {
    console.log('No existing servers found, starting with empty array');
    servers = [];
    // Save the empty array to create the file
    await saveServers();
  }
}

// Save servers to file
async function saveServers() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(servers, null, 2));
  } catch (err) {
    console.error('Error saving servers:', err);
  }
}

// API Routes
const apiRoutes = require('./routes/api')(io, servers, saveServers);
app.use('/api', apiRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
async function startServer() {
  await loadServers();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer(); 