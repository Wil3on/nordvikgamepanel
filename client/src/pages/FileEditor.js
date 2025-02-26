import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert,
  Breadcrumbs
} from '@mui/material';
import { 
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import axios from 'axios';

const FileEditor = () => {
  const { id, '*': filePath } = useParams();
  
  const [file, setFile] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const fetchFile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/files/${id}/content/${filePath}`);
      setFile(response.data);
      setContent(response.data.content);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch file: ${err.response?.data?.details || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [id, filePath]);
  
  useEffect(() => {
    fetchFile();
  }, [fetchFile]);
  
  const saveFile = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      
      await axios.post(`/api/files/${id}/content/${filePath}`, { content });
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setSaveError(`Failed to save file: ${err.response?.data?.details || err.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  const getPathParts = () => {
    if (!filePath) return [];
    return filePath.split('/');
  };
  
  const getDirectoryPath = () => {
    const parts = getPathParts();
    return parts.slice(0, -1).join('/');
  };
  
  const renderBreadcrumbs = () => {
    const parts = getPathParts();
    const fileName = parts[parts.length - 1];
    
    return (
      <Breadcrumbs aria-label="breadcrumb">
        <Link 
          to={`/servers/${id}/files`}
          className="text-blue-600 hover:underline flex items-center"
        >
          <FolderIcon fontSize="small" className="mr-1" />
          Root
        </Link>
        
        {parts.slice(0, -1).map((part, index) => {
          const path = parts.slice(0, index + 1).join('/');
          
          return (
            <Link 
              key={path} 
              to={`/servers/${id}/files/${path}`}
              className="text-blue-600 hover:underline"
            >
              {part}
            </Link>
          );
        })}
        
        <Typography color="text.primary">
          {fileName}
        </Typography>
      </Breadcrumbs>
    );
  };
  
  return (
    <Box className="pb-6">
      <Box className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <Button
            component={Link}
            to={`/servers/${id}/files/${getDirectoryPath()}`}
            startIcon={<ArrowBackIcon />}
            variant="text"
            className="mb-2"
          >
            Back to Files
          </Button>
          <Typography variant="h5" component="h1" gutterBottom>
            Edit File
          </Typography>
        </div>
        
        <div>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveFile}
            disabled={loading || saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Box>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      {saveError && (
        <Alert severity="error" className="mb-4">
          {saveError}
        </Alert>
      )}
      
      {saveSuccess && (
        <Alert severity="success" className="mb-4">
          File saved successfully!
        </Alert>
      )}
      
      <Paper elevation={0} className="p-4 border rounded mb-4">
        {renderBreadcrumbs()}
      </Paper>
      
      {loading ? (
        <Box className="flex justify-center items-center p-8">
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={0} className="border rounded overflow-hidden">
          <textarea
            className="file-editor p-4 w-full font-mono text-sm border-0 focus:outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck="false"
          />
        </Paper>
      )}
    </Box>
  );
};

export default FileEditor;