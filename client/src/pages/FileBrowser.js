import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ServerContext } from '../contexts/ServerContext';
import { 
  Box, 
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  AlertTitle,
  Menu,
  MenuItem,
  Divider,
  ClickAwayListener,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  CreateNewFolder as CreateNewFolderIcon,
  NoteAdd as NewFileIcon,
  UploadFile as UploadIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as BackIcon,
  ContentCut as CutIcon,
  ContentCopy as CopyIcon,
  DriveFileRenameOutline as RenameIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import axios from 'axios';

const FileBrowser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getServer } = useContext(ServerContext);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createFileOpen, setCreateFileOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [uploadKey, setUploadKey] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [clipboard, setClipboard] = useState(null);

  useEffect(() => {
    loadFiles();
  }, [id, currentPath]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const serverData = await getServer(id);
      
      if (!serverData.isInstalled) {
        navigate(`/servers/${id}`, {
          state: { message: 'Server must be installed first', severity: 'warning' }
        });
        return;
      }

      const response = await axios.get(`/api/files/${id}/${currentPath}`);
      setFiles(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading files:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    try {
      const path = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;
      await axios.post(`/api/files/${id}/directory`, { dirPath: path });
      setCreateFolderOpen(false);
      setNewFolderName('');
      loadFiles();
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleCreateFile = async () => {
    try {
      const path = currentPath ? `${currentPath}/${newFileName}` : newFileName;
      await axios.post(`/api/files/${id}/content/${path}`, { content: '' });
      setCreateFileOpen(false);
      setNewFileName('');
      loadFiles();
    } catch (err) {
      console.error('Error creating file:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleFileClick = (file) => {
    if (file.isDirectory) {
      const newPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      setCurrentPath(newPath);
    } else {
      handleView(file);
    }
  };

  const handleEdit = (file) => {
    const path = currentPath ? `${currentPath}/${file.name}` : file.name;
    navigate(`/servers/${id}/edit/${encodeURIComponent(path)}`);
    setMenuAnchor(null);
    setContextMenu(null);
  };

  const handleView = (file) => {
    const path = currentPath ? `${currentPath}/${file.name}` : file.name;
    navigate(`/servers/${id}/view/${encodeURIComponent(path)}`);
    setMenuAnchor(null);
    setContextMenu(null);
  };

  const handleDownload = async (file) => {
    try {
      const path = currentPath ? `${currentPath}/${file.name}` : file.name;
      const response = await axios.get(`/api/files/${id}/content/${path}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMenuAnchor(null);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await axios.post(`/api/files/${id}/upload?path=${currentPath}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadKey(prev => prev + 1);
      loadFiles();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    
    try {
      const path = currentPath ? `${currentPath}/${selectedFile.name}` : selectedFile.name;
      await axios.delete(`/api/files/${id}/${path}`);
      setSelectedFile(null);
      setMenuAnchor(null);
      setConfirmDelete(false);
      loadFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleBack = () => {
    if (!currentPath) {
      navigate(`/servers/${id}`);
      return;
    }
    
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  const renderBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    
    return (
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link 
          component="button"
          variant="body1" 
          onClick={() => setCurrentPath('')}
          underline="hover"
        >
          root
        </Link>
        {parts.map((part, index) => {
          const path = parts.slice(0, index + 1).join('/');
          return (
            <Link
              key={path}
              component="button"
              variant="body1"
              onClick={() => setCurrentPath(path)}
              underline="hover"
            >
              {part}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  const handleContextMenu = (event, file) => {
    event.preventDefault();
    setSelectedFile(file);
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  };

  const handleRename = async () => {
    if (!selectedFile) return;
    
    try {
      const oldPath = currentPath ? `${currentPath}/${selectedFile.name}` : selectedFile.name;
      const newPath = currentPath ? `${currentPath}/${newName}` : newName;
      
      await axios.post(`/api/files/${id}/rename`, {
        oldPath,
        newPath
      });
      
      setRenameOpen(false);
      setNewName('');
      setSelectedFile(null);
      loadFiles();
    } catch (err) {
      console.error('Error renaming file:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleCut = () => {
    setClipboard({ action: 'cut', file: selectedFile });
    setContextMenu(null);
    setSelectedFile(null);
  };

  const handleCopy = () => {
    setClipboard({ action: 'copy', file: selectedFile });
    setContextMenu(null);
    setSelectedFile(null);
  };

  const handlePaste = async () => {
    if (!clipboard) return;
    
    try {
      const sourcePath = clipboard.file.path;
      const targetPath = currentPath 
        ? `${currentPath}/${clipboard.file.name}`
        : clipboard.file.name;

      await axios.post(`/api/files/${id}/copy`, {
        sourcePath,
        targetPath,
        move: clipboard.action === 'cut'
      });

      if (clipboard.action === 'cut') {
        setClipboard(null);
      }
      
      loadFiles();
    } catch (err) {
      console.error('Error pasting file:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <PageHeader
        title="File Manager"
        subtitle={`Managing files for server ${id}`}
        action={true}
        actionText="Back"
        actionIcon={<BackIcon />}
        onActionClick={handleBack}
      />

      {renderBreadcrumbs()}

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<CreateNewFolderIcon />}
          onClick={() => setCreateFolderOpen(true)}
          sx={{ mr: 1 }}
        >
          New Folder
        </Button>
        <Button
          variant="contained"
          startIcon={<NewFileIcon />}
          onClick={() => setCreateFileOpen(true)}
          sx={{ mr: 1 }}
        >
          New File
        </Button>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
        >
          Upload File
          <input
            key={uploadKey}
            type="file"
            hidden
            onChange={handleUpload}
          />
        </Button>
      </Box>

      <Paper>
        <ClickAwayListener onClickAway={() => setContextMenu(null)}>
          <List>
            {files.map((file) => (
              <ListItem
                key={file.name}
                disablePadding
                onContextMenu={(e) => handleContextMenu(e, file)}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    onClick={(event) => {
                      setSelectedFile(file);
                      setMenuAnchor(event.currentTarget);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                }
              >
                <ListItemButton onClick={() => handleFileClick(file)}>
                  <ListItemIcon>
                    {file.isDirectory ? <FolderIcon /> : <FileIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={file.name}
                    secondary={
                      <>
                        {!file.isDirectory && `Size: ${file.size} bytes`}
                        {file.modified && ` • Modified: ${new Date(file.modified).toLocaleString()}`}
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {files.length === 0 && (
              <ListItem>
                <ListItemText 
                  primary="This folder is empty"
                  secondary="Upload files or create new ones using the buttons above"
                />
              </ListItem>
            )}
          </List>
        </ClickAwayListener>
      </Paper>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onClose={() => setCreateFolderOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create File Dialog */}
      <Dialog open={createFileOpen} onClose={() => setCreateFileOpen(false)}>
        <DialogTitle>Create New File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFileOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFile} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* File Actions Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {selectedFile && !selectedFile.isDirectory && (
          <MenuItem onClick={() => {
            handleView(selectedFile);
            setContextMenu(null);
          }}>
            <ListItemIcon>
              <OpenIcon fontSize="small" />
            </ListItemIcon>
            Open
          </MenuItem>
        )}
        <MenuItem onClick={handleCut}>
          <ListItemIcon>
            <CutIcon fontSize="small" />
          </ListItemIcon>
          Cut
        </MenuItem>
        <MenuItem onClick={handleCopy}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          Copy
        </MenuItem>
        {clipboard && (
          <MenuItem onClick={handlePaste}>
            <ListItemIcon>
              <ContentPasteIcon fontSize="small" />
            </ListItemIcon>
            Paste
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => {
          setNewName(selectedFile.name);
          setRenameOpen(true);
          setContextMenu(null);
        }}>
          <ListItemIcon>
            <RenameIcon fontSize="small" />
          </ListItemIcon>
          Rename
        </MenuItem>
        {selectedFile && !selectedFile.isDirectory && (
          <MenuItem onClick={() => {
            handleDownload(selectedFile);
            setContextMenu(null);
          }}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            Download
          </MenuItem>
        )}
        <Divider />
        <MenuItem 
          onClick={() => {
            setConfirmDelete(true);
            setContextMenu(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedFile?.name}"?
            {selectedFile?.isDirectory && " This will delete all contents of the folder."}
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)}>
        <DialogTitle>Rename {selectedFile?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button onClick={handleRename} variant="contained">Rename</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileBrowser;