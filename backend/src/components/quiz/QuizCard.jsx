import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Avatar, Button } from '@mui/material';
import { Quiz as QuizIcon, Timer, HelpOutline, Star } from '@mui/icons-material';

export default function QuizCard({ quiz, onStart }) {
  const color     = quiz.status === 'completed' ? '#00897b' : '#1a237e';
  const completed = quiz.status === 'completed';

  return (
    <Card sx={{
      height: '100%', display: 'flex', flexDirection: 'column',
      transition: 'transform .2s', '&:hover': { transform: 'translateY(-4px)' },
    }}>
      <Box sx={{ height: 6, bgcolor: color, borderRadius: '16px 16px 0 0' }} />
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}18` }}>
            <QuizIcon sx={{ color }} />
          </Avatar>
          <Chip
            label={completed ? 'Completed' : 'Available'}
            size="small"
            color={completed ? 'success' : 'primary'}
            variant="outlined"
          />
        </Box>
        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>{quiz.title}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>{quiz.course}</Typography>

        <Box sx={{ display: 'flex', gap: 2.5, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Timer sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{quiz.timeLimit} min</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HelpOutline sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{quiz.questions?.length || quiz.questionCount || 0} Qs</Typography>
          </Box>
        </Box>

        {completed && quiz.bestScore !== null && quiz.bestScore !== undefined && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#00897b0d', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star sx={{ color: '#00897b', fontSize: 18 }} />
            <Typography variant="body2" fontWeight={700} color="success.main">Best: {quiz.bestScore}%</Typography>
          </Box>
        )}
      </CardContent>
      <Box sx={{ px: 3, pb: 3 }}>
        <Button variant="contained" fullWidth onClick={() => onStart?.(quiz)}
          sx={{ bgcolor: color, '&:hover': { bgcolor: `${color}dd` } }}>
          {completed ? 'Retake Quiz' : 'Start Quiz'}
        </Button>
      </Box>
    </Card>
  );
}
