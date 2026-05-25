import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary:    { main: '#1a237e', light: '#534bae', dark: '#000051' },
    secondary:  { main: '#ff6f00', light: '#ffa000', dark: '#c43e00' },
    success:    { main: '#00897b' },
    error:      { main: '#b71c1c' },
    background: { default: '#f4f6fb', paper: '#ffffff' },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    h1: { fontWeight: 800 }, h2: { fontWeight: 800 },
    h3: { fontWeight: 700 }, h4: { fontWeight: 700 },
    h5: { fontWeight: 700 }, h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, textTransform: 'none', fontWeight: 700, boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.05)' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
    },
    MuiAppBar: {
      styleOverrides: { root: { boxShadow: 'none' } },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { border: 'none', boxShadow: '2px 0 20px rgba(0,0,0,0.08)' },
      },
    },
  },
});

export default theme;
