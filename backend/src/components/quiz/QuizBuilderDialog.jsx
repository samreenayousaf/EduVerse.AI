import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Box, Typography, IconButton, Grid, Divider,
} from '@mui/material';
import { Add, Delete, CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';

const BLANK_Q    = { question: '', options: ['', '', '', ''], correctIndex: 0 };
const BLANK_FORM = { title: '', course: '', timeLimit: 20, passingScore: 60 };

export default function QuizBuilderDialog({ open, courses = [], onClose, onCreate }) {
  const [form,      setForm]      = useState(BLANK_FORM);
  const [questions, setQuestions] = useState([{ ...BLANK_Q, options: ['', '', '', ''] }]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setQ = (i, k, v) => {
    const qs = [...questions];
    qs[i] = { ...qs[i], [k]: v };
    setQuestions(qs);
  };
  const setOpt = (qi, oi, v) => {
    const qs = [...questions];
    qs[qi].options[oi] = v;
    setQuestions(qs);
  };
  const addQ    = () => setQuestions(qs => [...qs, { ...BLANK_Q, options: ['', '', '', ''] }]);
  const removeQ = (i) => setQuestions(qs => qs.filter((_, idx) => idx !== i));

  const handleCreate = () => {
    if (!form.title || !form.course) { toast.error('Title and course are required.'); return; }
    if (questions.some(q => !q.question || q.options.some(o => !o))) {
      toast.error('Fill in all questions and options.'); return;
    }
    onCreate?.({ ...form, questions });
    setForm(BLANK_FORM);
    setQuestions([{ ...BLANK_Q, options: ['', '', '', ''] }]);
    onClose();
    toast.success('Quiz created!');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle fontWeight={800}>Create New Quiz</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Quiz Title *" value={form.title} onChange={e => setF('title', e.target.value)} fullWidth />
          <TextField select label="Course *" value={form.course} onChange={e => setF('course', e.target.value)} sx={{ minWidth: 200 }}>
            {courses.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Time Limit (min)" type="number" value={form.timeLimit}
            onChange={e => setF('timeLimit', e.target.value)} fullWidth />
          <TextField label="Passing Score (%)" type="number" value={form.passingScore}
            onChange={e => setF('passingScore', e.target.value)} fullWidth />
        </Box>

        <Divider />
        <Typography variant="subtitle1" fontWeight={700}>Questions ({questions.length})</Typography>

        {questions.map((q, qi) => (
          <Box key={qi} sx={{ p: 2.5, bgcolor: '#f4f6fb', borderRadius: 3, border: '1px solid #e8e8f0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" fontWeight={700} color="primary">Question {qi + 1}</Typography>
              {questions.length > 1 && (
                <IconButton size="small" color="error" onClick={() => removeQ(qi)}><Delete fontSize="small" /></IconButton>
              )}
            </Box>
            <TextField
              label="Question text *" value={q.question} fullWidth size="small"
              onChange={e => setQ(qi, 'question', e.target.value)} sx={{ mb: 2 }}
            />
            <Grid container spacing={1.5}>
              {q.options.map((opt, oi) => (
                <Grid item xs={6} key={oi}>
                  <TextField
                    size="small" fullWidth value={opt}
                    onChange={e => setOpt(qi, oi, e.target.value)}
                    onClick={() => setQ(qi, 'correctIndex', oi)}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {q.correctIndex === oi && <CheckCircle sx={{ fontSize: 14, color: '#00897b' }} />}
                        Option {oi + 1}{q.correctIndex === oi ? ' (Correct)' : ''}
                      </Box>
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: q.correctIndex === oi ? '#00897b08' : undefined,
                        borderColor: q.correctIndex === oi ? '#00897b' : undefined,
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Click an option to mark it as the correct answer
            </Typography>
          </Box>
        ))}

        <Button variant="outlined" startIcon={<Add />} onClick={addQ} sx={{ alignSelf: 'flex-start' }}>
          Add Question
        </Button>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleCreate}>Create Quiz</Button>
      </DialogActions>
    </Dialog>
  );
}
