import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SocketContext } from '../contexts/SocketContext';
import { ServerContext } from '../contexts/ServerContext';
import 'xterm/css/xterm.css';

const ServerConsole = () => {
  const { id } = useParams();
  const { subscribeToConsole } = useContext(SocketContext);
  const { getServer } = useContext(ServerContext);
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const terminalRef = useRef(null);
  const terminalInstanceRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    const fetchServer = async () => {
      try {
        setLoading(true);
        const serverData = await getServer(id);
        setServer(serverData);
        setError(null);
      } catch (err) {
        setError(`Failed to fetch server: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchServer();
  }, [id, getServer]);

  useEffect(() => {
    if (!loading && terminalRef.current) {
      // Initialize terminal
      const terminal = new Terminal({
        cursorBlink: false,
        fontFamily: 'Menlo, Monaco, Courier New, monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#f0f0f0'
        }
      });
      
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      
      terminal.open(terminalRef.current);
      fitAddon.fit();
      
      terminalInstanceRef.current = terminal;
      fitAddonRef.current = fitAddon;
      
      // Subscribe to console output
      const unsubscribe = subscribeToConsole(id, (data) => {
        terminal.write(data);
      });
      
      // Handle window resize
      const handleResize = () => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Initial welcome message
      terminal.write('\x1b[1;34m=== Nordvik Panel Server Console ===\x1b[0m\r\n');
      terminal.write(`\x1b[33mConnected to server: ${server?.config?.name || id}\x1b[0m\r\n`);
      
      if (server?.isRunning) {
        terminal.write('\x1b[32mServer is running. Displaying output...\x1b[0m\r\n\r\n');
      } else {
        terminal.write('\x1b[31mServer is not running. Start the server to see console output.\x1b[0m\r\n');
      }
      
      return () => {
        if (unsubscribe) unsubscribe();
        window.removeEventListener('resize', handleResize);
        terminal.dispose();
      };
    }
  }, [loading, id, server, subscribeToConsole]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="pb-6">
      <Box className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <Button
            component={Link}
            to={`/servers/${id}`}
            startIcon={<ArrowBackIcon />}
            variant="text"
            className="mb-2"
          >
            Back to Server
          </Button>
          <Typography variant="h5" component="h1" gutterBottom>
            Console: {server?.config?.name || id}
          </Typography>
        </div>
      </Box>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      {!server?.isRunning && (
        <Alert severity="warning" className="mb-4">
          Server is not running. Start the server to see console output.
        </Alert>
      )}
      
      <Paper 
        elevation={0} 
        className="p-0 overflow-hidden border rounded"
        sx={{ height: '70vh', minHeight: '500px' }}
      >
        <Box 
          ref={terminalRef} 
          className="terminal-container h-full"
        />
      </Paper>
    </Box>
  );
};

export default ServerConsole;