import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from '../pages/Dashboard';
import ServerDetail from '../pages/ServerDetail';
import ServerConsole from '../pages/ServerConsole';
import ServerConfig from '../pages/ServerConfig';
import FileBrowser from '../pages/FileBrowser';
import FileEditor from '../pages/FileEditor';
import DevelopmentModeIndicator from './DevelopmentModeIndicator';
import { ServerContext } from '../contexts/ServerContext';

const AppContent = () => {
  // Now this context call works because we're inside ServerProvider
  const { usingMockApi } = useContext(ServerContext);
  
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/servers/:id" element={<ServerDetail />} />
          <Route path="/servers/:id/console" element={<ServerConsole />} />
          <Route path="/servers/:id/config" element={<ServerConfig />} />
          <Route path="/servers/:id/files/*" element={<FileBrowser />} />
          <Route path="/servers/:id/edit/*" element={<FileEditor />} />
        </Routes>
      </Layout>
      <DevelopmentModeIndicator usingMockApi={usingMockApi} />
    </>
  );
};

export default AppContent; 