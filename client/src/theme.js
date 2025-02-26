import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2563eb', // Deeper blue
      light: '#3b82f6',
      dark: '#1e40af',
    },
    secondary: {
      main: '#0ea5e9', // Sky blue for accents
      light: '#38bdf8',
      dark: '#0284c7',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#010714', // Almost black with subtle blue tint like in screenshot
      paper: '#0c1222',   // Slightly lighter for cards
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#020617',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(15, 23, 42, 0.8)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(37, 99, 235, 0.5)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(59, 130, 246, 0.7)',
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#010714', // Match the very dark background
          borderBottom: '1px solid rgba(30, 41, 59, 0.5)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0a1322', // Like the blue sidebar in screenshot
          borderRight: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          boxShadow: '0 4px 14px 0 rgba(14, 29, 72, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            boxShadow: '0 6px 20px rgba(14, 29, 72, 0.6)',
          },
        },
        outlined: {
          borderColor: 'rgba(59, 130, 246, 0.3)',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(59, 130, 246, 0.15)',
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(2, 6, 23, 0.8), 0 0 0 1px rgba(30, 64, 175, 0.1)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(2, 6, 23, 0.8), 0 0 0 1px rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(59, 130, 246, 0.1)',
          backgroundImage: 'linear-gradient(145deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.3)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 24,
          border: '1px solid rgba(59, 130, 246, 0.2)',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
        },
        colorPrimary: {
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          color: '#60a5fa',
          borderColor: 'rgba(37, 99, 235, 0.3)',
        },
        colorSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          color: '#34d399',
          borderColor: 'rgba(16, 185, 129, 0.3)',
        },
        colorError: {
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          color: '#f87171',
          borderColor: 'rgba(239, 68, 68, 0.3)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(37, 99, 235, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(37, 99, 235, 0.1)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme; 