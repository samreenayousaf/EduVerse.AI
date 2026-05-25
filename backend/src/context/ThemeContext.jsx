import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeCtx = createContext({ mode: 'light', toggleMode: () => {} });
export const useThemeMode = () => useContext(ThemeCtx);

const makeTheme = (mode) => createTheme({
  palette: {
    mode,
    primary:   { main: '#374151', light: '#6B7280', dark: '#111827' },
    secondary: { main: '#6B7280' },
    success:   { main: '#16A34A' },
    error:     { main: '#DC2626' },
    warning:   { main: '#D97706' },
    background: {
      default: mode === 'light' ? '#F9FAFB' : '#111827',
      paper:   mode === 'light' ? '#FFFFFF'  : '#1F2937',
    },
    text: {
      primary:   mode === 'light' ? '#111827' : '#F9FAFB',
      secondary: mode === 'light' ? '#6B7280' : '#9CA3AF',
    },
    divider: mode === 'light' ? '#E5E7EB' : '#374151',
  },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    h1: { fontWeight: 800 }, h2: { fontWeight: 800 },
    h3: { fontWeight: 700 }, h4: { fontWeight: 700 },
    h5: { fontWeight: 700 }, h6: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    mode === 'light' ? '0 1px 3px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.4)',
    mode === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.4)',
    mode === 'light' ? '0 4px 16px rgba(0,0,0,0.08)' : '0 4px 16px rgba(0,0,0,0.4)',
    ...Array(21).fill(mode === 'light' ? '0 4px 24px rgba(0,0,0,0.1)' : '0 4px 24px rgba(0,0,0,0.5)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, textTransform: 'none', fontWeight: 600, boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          backgroundColor: mode === 'light' ? '#1F2937' : '#374151',
          color: '#FFFFFF',
          '&:hover': { backgroundColor: mode === 'light' ? '#111827' : '#4B5563' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' ? '0 1px 4px rgba(0,0,0,0.06)' : '0 1px 4px rgba(0,0,0,0.4)',
          border: `1px solid ${mode === 'light' ? '#E5E7EB' : '#374151'}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1F2937',
          color: mode === 'light' ? '#111827' : '#F9FAFB',
          borderBottom: `1px solid ${mode === 'light' ? '#E5E7EB' : '#374151'}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1F2937',
          borderRight: `1px solid ${mode === 'light' ? '#E5E7EB' : '#374151'}`,
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 600 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: mode === 'light' ? '#F3F4F6' : '#374151',
            color: mode === 'light' ? '#6B7280' : '#9CA3AF',
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
});

export function AppThemeProvider({ children }) {
  const saved = localStorage.getItem('lms_theme') || 'light';
  const [mode, setMode] = useState(saved);
  const toggleMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('lms_theme', next);
  };
  const theme = makeTheme(mode);
  return (
    <ThemeCtx.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeCtx.Provider>
  );
}