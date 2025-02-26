import { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'userMockApiPreference';

export const useMockApiStatus = () => {
  // Get initial state from localStorage or environment variable
  const [usingMockApi, setUsingMockApi] = useState(() => {
    const savedPreference = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    // If user has explicitly set a preference, use that
    if (savedPreference !== null) {
      return savedPreference === 'true';
    }
    
    // Otherwise check environment variable
    if (process.env.REACT_APP_DEVELOPMENT_MODE !== undefined) {
      return process.env.REACT_APP_DEVELOPMENT_MODE === 'true';
    }
    
    // Final fallback - use development mode in development environment
    return process.env.NODE_ENV === 'development';
  });
  
  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, String(usingMockApi));
  }, [usingMockApi]);
  
  // Force reload when changing API mode
  const toggleMockApi = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, String(!usingMockApi));
    return !usingMockApi;
  };
  
  return { usingMockApi, toggleMockApi };
}; 