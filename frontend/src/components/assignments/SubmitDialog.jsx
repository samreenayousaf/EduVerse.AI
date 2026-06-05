import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Typography, Box, Chip, Alert,
} from '@mui/material';
import { Assignment, Schedule } from '@mui/icons-material';
import { formatDate, isOverdue } from '../../utils/helpers';
import { toast } from 'react-toastify';

export default function SubmitDialog({ open, assignment, onClose, onSubmit }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!assignment) return null;
  const overdue = isOverdue(assignment.dueDate);

  const handleSubmit = async () => {
    if (!content.trim()) { toast.error('Please write your answer before submitting.'); return; }
    setLoading(true);
    try {
      await onSubmit?.({ content });
      toast.success('Assignment submitted successfully!');
      setContent('');
      onClose();
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle fontWeight={800}>Submit Assignment</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Box sx={{ p: 2, bgcolor: '#f4f6fb', borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>{assignment.title}</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>{assignment.description}</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Schedule sx={{ fontSize: 14, color: overdue ? 'error.main' : 'text.secondary' }} />
              <Typography variant="caption" color={overdue ? 'error.main' : 'text.secondary'}>
                Due: {formatDate(assignment.dueDate)}
              </Typography>
            </Box>
            <Chip label={`${assignment.totalPoints} pts`} size="small" />
          </Box>
        </Box>

        {overdue && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            This assignment is past due. Your submission will be marked as late.
          </Alert>
        )}

        <TextField
          label="Your Answer / Solution"
          multiline rows={7}
          value={content}
          onChange={e => setContent(e.target.value)}
          fullWidth
          placeholder="Write your answer, paste your code, or describe your solution here…"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
          {content.length} characters
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} startIcon={<Assignment />}>
          {loading ? 'Submitting…' : 'Submit Assignment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
