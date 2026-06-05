import React from 'react';
import {
  Card, CardContent, CardActions, Box, Typography, Chip,
  LinearProgress, Button, Avatar,
} from '@mui/material';
import { PlayCircle, People, Star, AccessTime } from '@mui/icons-material';
import { categoryColor } from '../../utils/helpers';

export default function CourseCard({ course, onAction, actionLabel = 'View', showProgress }) {
  const color = categoryColor[course.category] || '#1a237e';
  return (
    <Card sx={{
      height: '100%', display: 'flex', flexDirection: 'column',
      transition: 'transform .2s, box-shadow .2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.12)' },
    }}>
      <Box sx={{
        height: 140, background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`,
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '16px 16px 0 0',
      }}>
        <PlayCircle sx={{ fontSize: 52, color: 'rgba(255,255,255,0.8)' }} />
        <Chip label={course.category || 'General'} size="small"
          sx={{ position: 'absolute', top: 12, right: 12,
            bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600 }} />
      </Box>

      <CardContent sx={{ flex: 1, p: 2.5 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>{course.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2,
        }}>{course.description}</Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: showProgress ? 2 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <People sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {course.studentsCount ?? course.enrolledStudents?.length ?? 0}
            </Typography>
          </Box>
          {course.duration && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{course.duration}</Typography>
            </Box>
          )}
          {course.rating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Star sx={{ fontSize: 15, color: '#f59e0b' }} />
              <Typography variant="caption" color="text.secondary">{course.rating}</Typography>
            </Box>
          )}
        </Box>

        {showProgress && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Progress</Typography>
              <Typography variant="caption" fontWeight={700} sx={{ color }}>
                {course.progress || 0}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={course.progress || 0}
              sx={{ height: 6, borderRadius: 3, bgcolor: `${color}20`,
                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }} />
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ px: 2.5, pb: 2.5 }}>
        <Button variant="contained" fullWidth onClick={() => onAction?.(course)}
          sx={{ background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)` }}>
          {actionLabel}
        </Button>
      </CardActions>
    </Card>
  );
}
