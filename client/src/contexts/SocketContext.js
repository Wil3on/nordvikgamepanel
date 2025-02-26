import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || '';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [installProgress, setInstallProgress] = useState({});

  useEffect(() => {
    // Create socket connection
    const newSocket = io(API_URL);
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });
    
    // Listen for installation progress events
    newSocket.on('server-install-progress', (data) => {
      setInstallProgress(prev => ({
        ...prev,
        [data.serverId]: {
          progress: data.progress,
          task: data.task,
          error: data.error || false
        }
      }));
    });
    
    setSocket(newSocket);
    
    // Clean up socket connection on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const subscribeToConsole = (serverId, callback) => {
    if (!socket) return null;
    
    socket.emit('subscribe-console', serverId);
    
    socket.on('console-output', ({ serverId: sid, data }) => {
      if (sid === serverId) {
        callback(data);
      }
    });
    
    return () => {
      socket.off('console-output');
    };
  };

  const resetInstallProgress = (serverId) => {
    setInstallProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[serverId];
      return newProgress;
    });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        subscribeToConsole,
        installProgress,
        resetInstallProgress
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};