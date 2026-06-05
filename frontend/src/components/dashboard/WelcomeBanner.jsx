import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { EmojiEvents, WbSunny } from '@mui/icons-material';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const roleGradient = {
  student:    'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
  instructor: 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 100%)',
  admin:      'linear-gradient(135deg, #b71c1c 0%, #c62828 100%)',
};

export default function WelcomeBanner({ user, subtitle, badge }) {
  const gradient = roleGradient[user?.role] || roleGradient.student;
  return (
    <Box sx={{
      background: gradient, borderRadius: 4, p: { xs: 3, md: 4 }, mb: 4,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <Box sx={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
      <Box sx={{ position: 'absolute', right: 80, bottom: -50, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)', fontSize: 24, fontWeight: 800 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <WbSunny sx={{ color: '#ffd700', fontSize: 18 }} />
            <Typography variant="body2" color="rgba(255,255,255,0.8)">{getGreeting()}</Typography>
          </Box>
          <Typography variant="h5" color="#fff" fontWeight={800}>{user?.name}!</Typography>
          {subtitle && <Typography variant="body2" color="rgba(255,255,255,0.75)" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
        </Box>
        {badge && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.15)', px: 2.5, py: 1.5, borderRadius: 3 }}>
            <EmojiEvents sx={{ color: '#ffd700', fontSize: 22 }} />
            <Box>
              <Typography variant="subtitle2" color="#fff" fontWeight={800}>{badge.title}</Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.7)">{badge.subtitle}</Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
