import React from 'react';
import { Box, Button, Typography, Divider } from '@mui/material';

const DEMOS = [
  { role: 'student',    email: 'student@demo.com',    password: 'demo123', color: '#1a237e' },
  { role: 'instructor', email: 'instructor@demo.com', password: 'demo123', color: '#4a148c' },
  { role: 'admin',      email: 'admin@demo.com',      password: 'demo123', color: '#b71c1c' },
];

export default function DemoLoginButtons({ onSelect }) {
  return (
    <Box>
      <Divider sx={{ my: 2.5 }}>
        <Typography variant="caption" color="text.secondary">Quick Demo Login</Typography>
      </Divider>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {DEMOS.map(d => (
          <Button
            key={d.role}
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => onSelect(d)}
            sx={{
              textTransform: 'capitalize',
              fontSize: '0.75rem',
              borderColor: d.color,
              color: d.color,
              '&:hover': { bgcolor: `${d.color}0d`, borderColor: d.color },
            }}
          >
            {d.role}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
