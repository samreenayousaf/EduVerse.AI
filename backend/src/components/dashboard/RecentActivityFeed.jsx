import React from 'react';
import { Box, Avatar, Typography, Chip } from '@mui/material';
import { CheckCircle, Quiz, Assignment, School } from '@mui/icons-material';

const ICONS = {
  quiz:       { icon: <Quiz />,       color: '#4a148c' },
  assignment: { icon: <Assignment />, color: '#1a237e' },
  course:     { icon: <School />,     color: '#00897b' },
  grade:      { icon: <CheckCircle />, color: '#e65100' },
};

export default function RecentActivityFeed({ activities = [] }) {
  if (!activities.length) return (
    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No recent activity.</Typography>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {activities.map((a, i) => {
        const cfg = ICONS[a.type] || ICONS.course;
        return (
          <Box key={i} sx={{
            display: 'flex', gap: 1.5, py: 1.5,
            borderBottom: i < activities.length - 1 ? '1px solid #f0f0f0' : 'none',
          }}>
            <Avatar sx={{ bgcolor: `${cfg.color}15`, width: 34, height: 34 }}>
              <Box sx={{ color: cfg.color, fontSize: 16, display: 'flex' }}>{cfg.icon}</Box>
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>{a.title}</Typography>
              <Typography variant="caption" color="text.secondary">{a.course}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              {a.score !== undefined && (
                <Chip label={`${a.score}%`} size="small"
                  sx={{ bgcolor: `${cfg.color}14`, color: cfg.color, fontWeight: 700, mb: 0.5 }} />
              )}
              <Typography variant="caption" color="text.secondary" display="block">{a.date}</Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
