import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Divider,
  Stack,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CancelIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import Editor from "@monaco-editor/react";
import PageHeader from '../components/PageHeader';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const FileViewer = () => {
  const { id, '*': filePath } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [content, setContent] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [fileInfo, setFileInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadFileContent();
  }, [id, filePath]);

  const loadFileContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/files/${id}/content/${encodeURIComponent(filePath)}`);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      if (response.data.content === undefined) {
        throw new Error('No content received from server');
      }

      setContent(response.data.content);
      setEditedContent(response.data.content);
      setFileInfo({
        name: response.data.name,
        size: response.data.size,
        modified: new Date(response.data.modified).toLocaleString(),
      });
    } catch (err) {
      console.error('Error loading file:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      await axios.post(`/api/files/${id}/content/${encodeURIComponent(filePath)}`, {
        content: editedContent
      });

      setContent(editedContent);
      setIsEditing(false);
      enqueueSnackbar('File saved successfully', { variant: 'success' });
      
      // Refresh file info
      const stats = await axios.get(`/api/files/${id}/content/${encodeURIComponent(filePath)}`);
      setFileInfo({
        ...fileInfo,
        size: stats.data.size,
        modified: new Date(stats.data.modified).toLocaleString(),
      });
    } catch (err) {
      console.error('Error saving file:', err);
      setError(err.response?.data?.error || err.message);
      enqueueSnackbar('Failed to save file', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleBack = () => {
    if (isEditing && editedContent !== content) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigateBack();
      }
    } else {
      navigateBack();
    }
  };

  const navigateBack = () => {
    const parts = filePath.split('/');
    parts.pop();
    const dirPath = parts.join('/');
    navigate(`/servers/${id}/files/${dirPath}`);
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      enqueueSnackbar('Content copied to clipboard', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to copy content', { variant: 'error' });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath.split('/').pop();
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  // Determine the language based on file extension
  const getLanguage = () => {
    const ext = filePath.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'xml': 'xml',
      'md': 'markdown',
      'py': 'python',
      'rb': 'ruby',
      'php': 'php',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'h': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'txt': 'plaintext',
      'log': 'plaintext',
      'yml': 'yaml',
      'yaml': 'yaml',
      'ini': 'ini',
      'cfg': 'ini',
      'conf': 'ini',
      'toml': 'toml',
    };
    return languageMap[ext] || 'plaintext';
  };

  const handleEditorChange = (value) => {
    setEditedContent(value);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title={`${isEditing ? 'Editing' : 'Viewing'}: ${filePath.split('/').pop()}`}
        subtitle={`Server: ${id}`}
        action={true}
        actionText="Back"
        actionIcon={<BackIcon />}
        onActionClick={handleBack}
        additionalActions={
          <Stack direction="row" spacing={1}>
            {!isEditing ? (
              <>
                <Tooltip title="Copy content">
                  <IconButton onClick={handleCopyContent} size="small">
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download file">
                  <IconButton onClick={handleDownload} size="small">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}>
                  <IconButton onClick={toggleTheme} size="small">
                    {isDarkTheme ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                  <IconButton onClick={toggleFullscreen} size="small">
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  size="small"
                >
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={isSaving}
                  size="small"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  size="small"
                >
                  Cancel
                </Button>
              </>
            )}
          </Stack>
        }
      />

      {fileInfo && (
        <Paper sx={{ mx: 2, mt: 1, p: 1 }} elevation={0} variant="outlined">
          <Stack direction="row" spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Size: {(fileInfo.size / 1024).toFixed(2)} KB
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography variant="body2" color="text.secondary">
              Modified: {fileInfo.modified}
            </Typography>
            {isEditing && (
              <>
                <Divider orientation="vertical" flexItem />
                <Typography variant="body2" color="warning.main">
                  Editing Mode
                </Typography>
              </>
            )}
          </Stack>
        </Paper>
      )}

      {error ? (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      ) : loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper 
          sx={{ 
            m: 2, 
            flex: 1,
            ...(isFullscreen && {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              m: 0,
              zIndex: 1300,
            })
          }}
        >
          <Editor
            height="100%"
            defaultLanguage={getLanguage()}
            value={isEditing ? editedContent : content}
            onChange={handleEditorChange}
            theme={isDarkTheme ? "vs-dark" : "light"}
            loading={<CircularProgress />}
            options={{
              readOnly: !isEditing,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: 'on',
              lineNumbers: 'on',
              folding: true,
              renderWhitespace: 'selection',
              automaticLayout: true,
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default FileViewer; 