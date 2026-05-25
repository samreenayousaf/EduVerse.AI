import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Typography, Avatar, Chip, LinearProgress, Slider,
} from '@mui/material';
import { Grading } from '@mui/icons-material';
import { gradeColor, gradeLabel } from '../../utils/helpers';
import { toast } from 'react-toastify';

export default function GradeDialog({ open, submission, totalPoints = 100, onClose, onSave }) {
  const [grade,    setGrade]    = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (submission) {
      setGrade(submission.grade ?? 0);
      setFeedback(submission.feedback ?? '');
    }
  }, [submission]);

  if (!submission) return null;
  const pct = Math.round((grade / totalPoints) * 100);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave?.({ grade, feedback });
      toast.success(`Graded ${submission.student}: ${grade}/${totalPoints}`);
      onClose();
    } catch {
      toast.error('Failed to save grade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle fontWeight={800}>Grade Submission</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#4a148c', fontWeight: 800 }}>{submission.student?.charAt(0).toUpperCase()}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700}>{submission.student}</Typography>
            <Typography variant="caption" color="text.secondary">Submitted answer</Typography>
          </Box>
        </Box>

        <Box sx={{ p: 2, bgcolor: '#f4f6fb', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">Student's Answer</Typography>
          <Typography variant="body2">{submission.content}</Typography>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>Grade: {grade} / {totalPoints}</Typography>
            <Chip
              label={gradeLabel(pct)}
              size="small"
              sx={{ bgcolor: `${gradeColor(pct)}18`, color: gradeColor(pct), fontWeight: 800 }}
            />
          </Box>
          <Slider
            value={grade}
            onChange={(_, v) => setGrade(v)}
            min={0} max={totalPoints} step={1}
            valueLabelDisplay="auto"
            sx={{ color: gradeColor(pct) }}
          />
          <LinearProgress
            variant="determinate" value={pct}
            sx={{ height: 8, borderRadius: 4, mt: 1,
              bgcolor: `${gradeColor(pct)}22`,
              '& .MuiLinearProgress-bar': { bgcolor: gradeColor(pct) } }}
          />
        </Box>

        <TextField
          label="Feedback (optional)"
          multiline rows={3}
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          fullWidth
          placeholder="Provide constructive feedback for the student…"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>Cancel</Button>
        <Button variant="contained" startIcon={<Grading />} onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : 'Save Grade'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
