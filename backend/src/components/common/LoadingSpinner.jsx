import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingSpinner({ message = 'Loading…', fullHeight = true }) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 2,
      minHeight: fullHeight ? '60vh' : 'auto', p: 4,
    }}>
      <CircularProgress size={44} thickness={4} />
      {message && <Typography variant="body2" color="text.secondary" fontWeight={500}>{message}</Typography>}
    </Box>
  );
}
