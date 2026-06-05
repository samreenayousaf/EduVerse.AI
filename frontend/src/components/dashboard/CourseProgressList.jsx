import React from 'react';
import { Box, Typography, LinearProgress, Avatar, Chip } from '@mui/material';
import { categoryColor } from '../../utils/helpers';

export default function CourseProgressList({ courses = [] }) {
  if (!courses.length) return (
    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
      No courses enrolled yet.
    </Typography>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {courses.map((c, i) => {
        const color = categoryColor(c.category);
        return (
          <Box key={i}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: `${color}18`, width: 32, height: 32, borderRadius: 1.5, fontSize: 12, color, fontWeight: 800 }}>
                  {c.title?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>{c.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{c.category}</Typography>
                </Box>
              </Box>
              <Chip
                label={`${c.progress || 0}%`}
                size="small"
                sx={{ bgcolor: `${color}14`, color, fontWeight: 800, fontSize: '0.7rem' }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={c.progress || 0}
              sx={{
                height: 6, borderRadius: 3, ml: 5.5,
                bgcolor: `${color}18`,
                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
