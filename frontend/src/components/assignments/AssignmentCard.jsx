import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Avatar, Button, LinearProgress } from '@mui/material';
import { Assignment, Schedule, CheckCircle, Warning } from '@mui/icons-material';
import { formatDate, isOverdue, getDaysLeft } from '../../utils/helpers';

export default function AssignmentCard({ assignment, onSubmit, onView }) {
  const { title, course, dueDate, totalPoints, status, grade } = assignment;
  const overdue = isOverdue(dueDate) && status === 'pending';

  const statusConfig = {
    pending:   { label: 'Pending',   color: overdue ? 'error' : 'warning', icon: overdue ? <Warning sx={{ fontSize: '13px !important' }} /> : <Schedule sx={{ fontSize: '13px !important' }} /> },
    submitted: { label: 'Submitted', color: 'info',    icon: null },
    graded:    { label: 'Graded',    color: 'success', icon: <CheckCircle sx={{ fontSize: '13px !important' }} /> },
  };
  const cfg = statusConfig[status] || statusConfig.pending;

  return (
    <Card sx={{
      transition: 'transform .2s, box-shadow .2s',
      '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
    }}>
      <Box sx={{ height: 5, bgcolor: overdue ? '#b71c1c' : '#1a237e', borderRadius: '12px 12px 0 0' }} />
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ bgcolor: '#1a237e14', width: 40, height: 40 }}>
            <Assignment sx={{ color: '#1a237e', fontSize: 20 }} />
          </Avatar>
          <Chip label={cfg.label} size="small" color={cfg.color} icon={cfg.icon} />
        </Box>

        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>{title}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>{course}</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: status === 'graded' ? 2 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Schedule sx={{ fontSize: 14, color: overdue ? 'error.main' : 'text.secondary' }} />
            <Typography variant="caption" color={overdue ? 'error.main' : 'text.secondary'} fontWeight={overdue ? 700 : 400}>
              {formatDate(dueDate)} · {getDaysLeft(dueDate)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">{totalPoints} pts</Typography>
        </Box>

        {status === 'graded' && grade !== null && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Your Score</Typography>
              <Typography variant="caption" fontWeight={800} color={grade >= 60 ? 'success.main' : 'error.main'}>
                {grade}/{totalPoints}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate" value={grade}
              sx={{
                height: 6, borderRadius: 3,
                bgcolor: grade >= 60 ? '#00897b22' : '#b71c1c22',
                '& .MuiLinearProgress-bar': { bgcolor: grade >= 60 ? '#00897b' : '#b71c1c' },
              }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          {status === 'pending' && (
            <Button variant="contained" size="small" fullWidth onClick={() => onSubmit?.(assignment)}>
              Submit
            </Button>
          )}
          {status !== 'pending' && (
            <Button variant="outlined" size="small" fullWidth onClick={() => onView?.(assignment)}>
              View Details
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
