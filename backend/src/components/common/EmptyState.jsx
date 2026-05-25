import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

export default function EmptyState({ title = 'Nothing here yet', subtitle, action, actionLabel, icon }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
      <Box sx={{ mb: 2, color: 'text.disabled', '& svg': { fontSize: 64 } }}>
        {icon || <InboxOutlined />}
      </Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{subtitle}</Typography>}
      {action && actionLabel && (
        <Button variant="contained" onClick={action}>{actionLabel}</Button>
      )}
    </Box>
  );
}
