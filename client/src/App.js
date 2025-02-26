import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SocketProvider } from './contexts/SocketContext';
import { ServerProvider } from './contexts/ServerContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ServerDetail from './pages/ServerDetail';
import ServerConsole from './pages/ServerConsole';
import ServerConfig from './pages/ServerConfig';
import FileBrowser from './pages/FileBrowser';
import FileEditor from './pages/FileEditor';
import FileViewer from './pages/FileViewer';
import DevelopmentModeIndicator from './components/DevelopmentModeIndicator';
import MockApiToggle from './components/MockApiToggle';
import theme from './theme';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SocketProvider>
        <ServerProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/servers/:id" element={<ServerDetail />} />
                <Route path="/servers/:id/console" element={<ServerConsole />} />
                <Route path="/servers/:id/config" element={<ServerConfig />} />
                <Route path="/servers/:id/files/*" element={<FileBrowser />} />
                <Route path="/servers/:id/view/*" element={<FileViewer />} />
                <Route path="/servers/:id/edit/*" element={<FileEditor />} />
              </Routes>
            </Layout>
          </Router>
          <DevelopmentModeIndicator />
          <MockApiToggle />
        </ServerProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
