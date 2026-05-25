import React from 'react';
import { Box, Typography, Button, Alert, Chip, DialogContent, DialogActions } from '@mui/material';
import { EmojiEvents, Quiz as QuizIcon, Refresh, Close } from '@mui/icons-material';

export default function QuizResults({ result, quiz, onClose, onRetake }) {
  const { percentage, score, total, passed } = result;
  const color = passed ? '#00897b' : '#b71c1c';

  return (
    <>
      <DialogContent sx={{ textAlign: 'center', py: 5 }}>
        <Box sx={{
          width: 100, height: 100, borderRadius: '50%', mx: 'auto', mb: 3,
          bgcolor: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {passed
            ? <EmojiEvents sx={{ fontSize: 52, color }} />
            : <QuizIcon     sx={{ fontSize: 52, color }} />}
        </Box>

        <Typography variant="h2" fontWeight={800} sx={{ color, lineHeight: 1 }}>{percentage}%</Typography>
        <Typography variant="h6" fontWeight={600} sx={{ mt: 1, mb: 0.5 }}>
          {passed ? 'Congratulations! You passed!' : 'Keep practicing!'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {quiz?.title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <Chip label={`${score}/${total} correct`} color={passed ? 'success' : 'error'} />
          <Chip label={`Pass mark: ${quiz?.passingScore || 60}%`} variant="outlined" />
        </Box>

        <Alert severity={passed ? 'success' : 'warning'} sx={{ textAlign: 'left', borderRadius: 2 }}>
          {passed
            ? `Great job! You scored ${percentage}%, well above the ${quiz?.passingScore || 60}% pass mark.`
            : `You scored ${percentage}%. You need ${quiz?.passingScore || 60}% to pass. Review the material and try again!`}
        </Alert>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
        <Button variant="outlined" startIcon={<Close />} onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<Refresh />} onClick={onRetake}>Retake Quiz</Button>
      </DialogActions>
    </>
  );
}
