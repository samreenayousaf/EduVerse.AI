import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  LinearProgress, Radio, RadioGroup, FormControlLabel, Avatar, Chip,
} from '@mui/material';
import { Timer, Quiz as QuizIcon } from '@mui/icons-material';
import QuizResults from './QuizResults';

export default function QuizRunner({ quiz, open, onClose, onSubmit }) {
  const [currentQ,  setCurrentQ]  = useState(0);
  const [answers,   setAnswers]   = useState({});
  const [timeLeft,  setTimeLeft]  = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result,    setResult]    = useState(null);

  useEffect(() => {
    if (open && quiz) {
      setCurrentQ(0);
      setAnswers({});
      setSubmitted(false);
      setResult(null);
      setTimeLeft((quiz.timeLimit || 30) * 60);
    }
  }, [open, quiz]);

  // Countdown timer
  useEffect(() => {
    if (!open || submitted || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [open, submitted, timeLeft]);

  const handleSubmit = useCallback(() => {
    if (!quiz) return;
    let score = 0;
    quiz.questions.forEach((q, i) => {
      const sel = answers[i];
      if (sel !== undefined && q.options[sel]?.isCorrect) score++;
    });
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const res = { score, percentage, total: quiz.questions.length, passed: percentage >= (quiz.passingScore || 60) };
    setResult(res);
    setSubmitted(true);
    onSubmit?.(res);
  }, [quiz, answers, onSubmit]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && open && !submitted) handleSubmit();
  }, [timeLeft, open, submitted, handleSubmit]);

  if (!quiz) return null;

  const q    = quiz.questions[currentQ];
  const pct  = Math.round(((currentQ + 1) / quiz.questions.length) * 100);
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const warn = timeLeft < 60;

  if (submitted && result) {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <QuizResults result={result} quiz={quiz} onClose={onClose} onRetake={() => { setSubmitted(false); setCurrentQ(0); setAnswers({}); setTimeLeft((quiz.timeLimit || 30) * 60); }} />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight={800}>{quiz.title}</Typography>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.75,
            bgcolor: warn ? '#b71c1c12' : '#1a237e12',
            px: 2, py: 0.75, borderRadius: 2,
          }}>
            <Timer sx={{ fontSize: 16, color: warn ? '#b71c1c' : '#1a237e' }} />
            <Typography variant="body2" fontWeight={700} color={warn ? 'error.main' : 'primary'}>
              {mins}:{secs}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Question {currentQ + 1} of {quiz.questions.length}</Typography>
            <Typography variant="caption" color="primary" fontWeight={700}>{pct}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3 }} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>{q.question}</Typography>
        <RadioGroup
          value={answers[currentQ] !== undefined ? answers[currentQ] : ''}
          onChange={e => setAnswers({ ...answers, [currentQ]: Number(e.target.value) })}
        >
          {q.options.map((opt, i) => {
            const selected = answers[currentQ] === i;
            return (
              <Box key={i} sx={{
                mb: 1.5, p: 1.75, borderRadius: 2, cursor: 'pointer',
                border: '2px solid', borderColor: selected ? '#1a237e' : '#e0e0e0',
                bgcolor: selected ? '#1a237e08' : 'transparent',
                transition: 'all .15s',
              }} onClick={() => setAnswers({ ...answers, [currentQ]: i })}>
                <FormControlLabel
                  value={i}
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">{opt.text || opt}</Typography>}
                  sx={{ m: 0, width: '100%', pointerEvents: 'none' }}
                />
              </Box>
            );
          })}
        </RadioGroup>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="outlined" onClick={onClose}>Exit</Button>
        <Box sx={{ flex: 1 }} />
        {currentQ > 0 && (
          <Button variant="outlined" onClick={() => setCurrentQ(q => q - 1)}>Previous</Button>
        )}
        {currentQ < quiz.questions.length - 1 ? (
          <Button variant="contained" onClick={() => setCurrentQ(q => q + 1)}
            disabled={answers[currentQ] === undefined}>Next</Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleSubmit}
            disabled={answers[currentQ] === undefined}>Submit Quiz</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
