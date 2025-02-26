import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import mockApiService from '../services/mockApiService';
import { useMockApiStatus } from '../hooks/useMockApiStatus';

export const ServerContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || '';

export const ServerProvider = ({ children }) => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Use our custom hook for mock API state management
  const { usingMockApi, toggleMockApi } = useMockApiStatus();

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!usingMockApi) {
        // Use real API
        const response = await axios.get(`${API_URL}/api/servers`);
        setServers(response.data);
      } else {
        // Use mock API
        const mockServers = await mockApiService.getServers();
        setServers(mockServers);
      }
    } catch (err) {
      console.error('Error fetching servers:', err);
      
      // If user wants real API but it failed
      if (!usingMockApi) {
        // Show the error
        handleError(err);
        setServers([]);
      } else {
        // In mock mode, but mock API also failed
        handleError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const refetchServers = () => {
    setRetryCount(0);
    fetchServers();
  };

  const getServer = async (id) => {
    try {
      if (!usingMockApi) {
        const response = await axios.get(`${API_URL}/api/servers/${id}`);
        return response.data;
      } else {
        // Use mock API for development
        console.log('Using mock API to get server:', id);
        const mockServer = await mockApiService.getServer(id);
        return mockServer;
      }
    } catch (err) {
      console.error(`Error getting server ${id}:`, err);
      
      // If real API fails, try mock API but don't modify usingMockApi
      if (!usingMockApi && err.response?.status === 404) {
        try {
          // Don't do this: usingMockApi = true; (it causes the error)
          console.log('Falling back to mock API to get server:', id);
          const mockServer = await mockApiService.getServer(id);
          return mockServer;
        } catch (mockErr) {
          throw mockErr;
        }
      }
      
      throw err;
    }
  };

  const createServer = async (id, config) => {
    console.log("Creating server with:", { id, config });
    
    try {
      if (!usingMockApi) {
        const response = await axios.post(`${API_URL}/api/servers`, { id, ...config });
        await fetchServers();
        console.log("Created server with real API:", response.data);
        return response.data;
      } else {
        // For mock API, explicitly set isInstalled to false
        const newServer = await mockApiService.createServer({
          id,
          ...config,
          isInstalled: false,  // Explicitly set isInstalled to false
          isRunning: false,
        });
        await fetchServers();
        console.log("Created server with mock API:", newServer);
        return newServer;
      }
    } catch (err) {
      console.error("Error creating server:", err);
      throw err;
    }
  };

  const updateServer = async (id, config) => {
    try {
      const response = await axios.put(`${API_URL}/api/servers/${id}`, config);
      await fetchServers();
      return response.data;
    } catch (err) {
      console.error(`Error updating server ${id}:`, err);
      throw err;
    }
  };

  const deleteServer = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/api/servers/${id}`);
      await fetchServers();
      return response.data;
    } catch (err) {
      console.error(`Error deleting server ${id}:`, err);
      throw err;
    }
  };

  const startServer = async (id) => {
    try {
      const response = await axios.post(`${API_URL}/api/servers/${id}/start`);
      await fetchServers();
      return response.data;
    } catch (err) {
      console.error(`Error starting server ${id}:`, err);
      throw err;
    }
  };

  const stopServer = async (id) => {
    try {
      const response = await axios.post(`${API_URL}/api/servers/${id}/stop`);
      await fetchServers();
      return response.data;
    } catch (err) {
      console.error(`Error stopping server ${id}:`, err);
      throw err;
    }
  };

  const installServer = async (id) => {
    try {
      if (!usingMockApi) {
        try {
          const response = await axios.post(`${API_URL}/api/servers/${id}/install`);
          return response.data;
        } catch (apiErr) {
          console.error(`Error installing server ${id}:`, apiErr);
          
          // Add more detailed logging to help diagnose the issue
          if (apiErr.response) {
            console.error('API Error Response:', apiErr.response.status, apiErr.response.data);
          }
          
          // If API fails with 500, try mock API as fallback
          if (apiErr.response?.status === 500 || apiErr.response?.status === 404) {
            console.log('API server error, falling back to mock API for installation');
            const mockServer = await mockApiService.installServer(id);
            return mockServer;
          }
          
          throw apiErr;
        }
      } else {
        // Use mock API for development
        console.log('Using mock API to install server:', id);
        const mockServer = await mockApiService.installServer(id);
        return mockServer;
      }
    } catch (err) {
      console.error(`Error installing server ${id}:`, err);
      throw err;
    }
  };

  const handleError = (err) => {
    // Improved error handling for HTTP errors
    if (err.response) {
      // Server responded with an error status
      if (err.response.status === 404) {
        setError({
          message: 'API endpoint not found',
          code: 404
        });
      } else {
        setError({
          message: err.response.data?.message || `Server error (${err.response.status})`,
          code: err.response.status
        });
      }
    } else if (err.request) {
      // Request was made but no response received
      setError({
        message: 'No response from server',
        code: 'NETWORK_ERROR'
      });
    } else {
      // Request setup error
      setError({
        message: err.message || 'Failed to fetch servers',
        code: 'REQUEST_ERROR'
      });
    }
    
    // Implement automatic retry logic for network errors
    if (retryCount < MAX_RETRIES && 
        (err.message?.includes('network') || err.code === 'ECONNABORTED')) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        fetchServers();
      }, 2000 * (retryCount + 1)); // Exponential backoff
    }
  };

  const contextValue = {
    servers,
    loading,
    error,
    fetchServers,
    getServer,
    createServer,
    updateServer,
    deleteServer,
    startServer,
    stopServer,
    installServer,
    refetchServers,
    usingMockApi,
    toggleMockApi
  };

  return (
    <ServerContext.Provider value={contextValue}>
      {children}
    </ServerContext.Provider>
  );
};