import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { AutoStories } from '@mui/icons-material';

const LoadingScreen = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: 2,
      background: 'linear-gradient(135deg, #0F4C81 0%, #00B4D8 100%)',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      <AutoStories sx={{ color: '#fff', fontSize: 36 }} />
      <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', letterSpacing: '-0.02em' }}>
        EduVerse.AI
      </Typography>
    </Box>
    <CircularProgress sx={{ color: 'rgba(255,255,255,0.9)' }} size={36} thickness={4} />
    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
      {message}
    </Typography>
  </Box>
);

export default LoadingScreen;
