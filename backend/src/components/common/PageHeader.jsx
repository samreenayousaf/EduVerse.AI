import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function PageHeader({ title, subtitle, breadcrumbs, action }) {
  const navigate = useNavigate();
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs && (
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 1 }}>
          {breadcrumbs.map((b, i) =>
            b.path ? (
              <Link key={i} underline="hover" color="text.secondary"
                sx={{ cursor: 'pointer', fontSize: '0.8rem' }}
                onClick={() => navigate(b.path)}>{b.label}</Link>
            ) : (
              <Typography key={i} color="text.primary"
                sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{b.label}</Typography>
            )
          )}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{title}</Typography>
          {subtitle && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
    </Box>
  );
}
