import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Card, Typography, Button, Chip, CircularProgress,
  Grid, Radio, RadioGroup, FormControlLabel, FormControl,
  LinearProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Quiz, Timer, CheckCircle, Cancel, EmojiEvents,
  ArrowForward, ArrowBack,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { quizAPI, enrollAPI } from '../../services/api';

export default function StudentQuizzes() {
  const [enrollments, setEnrollments] = useState([]);
  const [quizzes,     setQuizzes]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeQuiz,  setActiveQuiz]  = useState(null); // quiz being attempted
  const [answers,     setAnswers]     = useState({});   // { qIdx: optionIdx }
  const [currentQ,    setCurrentQ]    = useState(0);
  const [timeLeft,    setTimeLeft]    = useState(0);
  const [result,      setResult]      = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const eRes = await enrollAPI.getMyEnroll();
        setEnrollments(eRes.data);
        const allQuizzes = [];
        for (const enr of eRes.data) {
          const cId = enr.courseId?._id || enr.courseId;
          if (!cId) continue;
          try {
            const qRes = await quizAPI.getByCourse(cId);
            allQuizzes.push(...(qRes.data || []));
          } catch {}
        }
        setQuizzes(allQuizzes);
      } catch { toast.error('Failed to load quizzes'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Timer
  useEffect(() => {
    if (!activeQuiz) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [activeQuiz]);

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setCurrentQ(0);
    setResult(null);
    setTimeLeft((quiz.timeLimit || 30) * 60);
  };

  const handleSubmit = async (auto = false) => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const answersArr = Object.entries(answers).map(([qIdx, optIdx]) => ({
        questionIndex: parseInt(qIdx),
        selectedOption: parseInt(optIdx),
      }));
      const res = await quizAPI.submit(activeQuiz._id, { answers: answersArr });
      setResult(res.data);
      if (auto) toast.info('Time up! Quiz auto-submitted.');
    } catch (err) {
      toast.error('Submit failed');
    } finally { setSubmitting(false); }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  };

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <CircularProgress size={48}/>
    </Box>
  );

  // ── Quiz Attempt UI ──────────────────────────────────────────────
  if (activeQuiz && !result) {
    const q   = activeQuiz.questions?.[currentQ];
    const total = activeQuiz.questions?.length || 1;
    const pct  = ((currentQ + 1) / total) * 100;
    const timeWarning = timeLeft < 120;
    return (
      <Box sx={{ maxWidth:720, mx:'auto' }}>
        {/* Header */}
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3, flexWrap:'wrap', gap:2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>{activeQuiz.title}</Typography>
            <Typography color="text.secondary">{activeQuiz.courseName}</Typography>
          </Box>
          <Box sx={{ display:'flex', alignItems:'center', gap:1,
            bgcolor: timeWarning ? '#ffebee' : '#e8eaf6',
            px:2, py:1, borderRadius:3 }}>
            <Timer sx={{ color: timeWarning ? '#d32f2f' : '#1a237e', fontSize:20 }}/>
            <Typography fontWeight={800}
              sx={{ color: timeWarning ? '#d32f2f' : '#1a237e', fontSize:'1.1rem', fontFamily:'monospace' }}>
              {formatTime(timeLeft)}
            </Typography>
          </Box>
        </Box>

        {/* Progress */}
        <Box sx={{ mb:3 }}>
          <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Question {currentQ + 1} of {total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Object.keys(answers).length} answered
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={pct}
            sx={{ height:6, borderRadius:3, '& .MuiLinearProgress-bar':{ bgcolor:'#1a237e' } }}/>
        </Box>

        {/* Question Card */}
        <Card sx={{ p:3.5, borderRadius:3, mb:3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb:3, lineHeight:1.5 }}>
            Q{currentQ + 1}. {q?.question}
          </Typography>
          <FormControl component="fieldset" sx={{ width:'100%' }}>
            <RadioGroup value={answers[currentQ] !== undefined ? String(answers[currentQ]) : ''}
              onChange={e => setAnswers(prev => ({ ...prev, [currentQ]: parseInt(e.target.value) }))}>
              {q?.options?.map((opt, idx) => (
                <Box key={idx} onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: idx }))}
                  sx={{
                    mb:1.5, p:1.5, borderRadius:2, cursor:'pointer',
                    border:`2px solid ${answers[currentQ] === idx ? '#1a237e' : '#e0e0e0'}`,
                    bgcolor: answers[currentQ] === idx ? '#e8eaf6' : 'transparent',
                    transition:'all 0.15s',
                    '&:hover':{ borderColor:'#1a237e', bgcolor:'#f0f1ff' },
                  }}>
                  <FormControlLabel value={String(idx)}
                    control={<Radio size="small" sx={{ color:'#1a237e' }}/>}
                    label={<Typography variant="body1">{opt.text}</Typography>}
                    sx={{ m:0, width:'100%' }}
                  />
                </Box>
              ))}
            </RadioGroup>
          </FormControl>
        </Card>

        {/* Navigation */}
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Button variant="outlined" startIcon={<ArrowBack/>}
            disabled={currentQ === 0}
            onClick={() => setCurrentQ(q => q - 1)}>
            Previous
          </Button>

          {/* Question dots */}
          <Box sx={{ display:'flex', gap:0.5 }}>
            {activeQuiz.questions?.map((_, i) => (
              <Box key={i} onClick={() => setCurrentQ(i)}
                sx={{
                  width:10, height:10, borderRadius:'50%', cursor:'pointer',
                  bgcolor: i === currentQ ? '#1a237e'
                    : answers[i] !== undefined ? '#00897b' : '#e0e0e0',
                  transition:'background 0.2s',
                }}/>
            ))}
          </Box>

          {currentQ < total - 1 ? (
            <Button variant="contained" endIcon={<ArrowForward/>}
              onClick={() => setCurrentQ(q => q + 1)}
              sx={{ bgcolor:'#1a237e' }}>
              Next
            </Button>
          ) : (
            <Button variant="contained" color="success" startIcon={<CheckCircle/>}
              onClick={() => handleSubmit(false)} disabled={submitting}>
              {submitting ? <CircularProgress size={18} color="inherit"/> : 'Submit Quiz'}
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  // ── Result UI ───────────────────────────────────────────────────
  if (result) {
    const passed = result.passed;
    return (
      <Box sx={{ maxWidth:600, mx:'auto', textAlign:'center' }}>
        <Card sx={{ p:5, borderRadius:4 }}>
          <Box sx={{ fontSize:72, mb:2 }}>
            {passed ? '🎉' : '💪'}
          </Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </Typography>
          <Typography color="text.secondary" sx={{ mb:4 }}>
            {activeQuiz.title}
          </Typography>

          <Box sx={{ display:'flex', justifyContent:'center', gap:4, mb:4 }}>
            <Box>
              <Typography variant="h3" fontWeight={800} color={passed ? '#00897b' : '#e65100'}>
                {result.percentage}%
              </Typography>
              <Typography color="text.secondary" variant="body2">Your Score</Typography>
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={800} color="text.secondary">
                {result.passingScore}%
              </Typography>
              <Typography color="text.secondary" variant="body2">Passing Score</Typography>
            </Box>
          </Box>

          <LinearProgress variant="determinate" value={result.percentage}
            sx={{ height:12, borderRadius:6, mb:3,
              '& .MuiLinearProgress-bar':{ bgcolor: passed ? '#00897b' : '#e65100' } }}/>

          <Alert severity={passed ? 'success' : 'warning'} sx={{ borderRadius:2, mb:3 }}>
            {passed
              ? `You scored ${result.score}/${result.totalPoints} points — Passed! ✅`
              : `You scored ${result.score}/${result.totalPoints} points — Need ${result.passingScore}% to pass`}
          </Alert>

          <Box sx={{ display:'flex', gap:2, justifyContent:'center' }}>
            <Button variant="outlined" onClick={() => { setActiveQuiz(null); setResult(null); }}>
              Back to Quizzes
            </Button>
            {!passed && (
              <Button variant="contained" onClick={() => startQuiz(activeQuiz)}
                sx={{ bgcolor:'#1a237e' }}>
                Retry Quiz
              </Button>
            )}
          </Box>
        </Card>
      </Box>
    );
  }

  // ── Quiz List ───────────────────────────────────────────────────
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb:1 }}>Quizzes & Tests</Typography>
    
      {quizzes.length === 0 ? (
        <Card sx={{ p:6, textAlign:'center', borderRadius:3 }}>
          <Quiz sx={{ fontSize:64, color:'#ccc', mb:2 }}/>
          <Typography color="text.secondary">No quizzes available yet.</Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {quizzes.map(q => {
            const myAttempts = q.attempts || [];
            const bestScore  = myAttempts.length
              ? Math.max(...myAttempts.map(a => a.percentage)) : null;
            const passed     = myAttempts.some(a => a.passed);
            return (
              <Grid item xs={12} sm={6} md={4} key={q._id}>
                <Card sx={{ p:3, borderRadius:3, height:'100%', display:'flex', flexDirection:'column' }}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', mb:1.5 }}>
                    <Chip label={q.courseName} size="small" variant="outlined"
                      sx={{ fontSize:'0.68rem', maxWidth:150 }}/>
                    {passed && <Chip label="Passed" size="small" color="success" sx={{ fontWeight:700 }}/>}
                  </Box>

                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {q.title}
                  </Typography>

                  <Box sx={{ display:'flex', gap:2, mb:2, flexWrap:'wrap' }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                      <Timer sx={{ fontSize:15, color:'#888' }}/>
                      <Typography variant="caption" color="text.secondary">
                        {q.timeLimit} min
                      </Typography>
                    </Box>
                    <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                      <Quiz sx={{ fontSize:15, color:'#888' }}/>
                      <Typography variant="caption" color="text.secondary">
                        {q.questions?.length || 0} questions
                      </Typography>
                    </Box>
                    <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                      <CheckCircle sx={{ fontSize:15, color:'#888' }}/>
                      <Typography variant="caption" color="text.secondary">
                        Pass: {q.passingScore}%
                      </Typography>
                    </Box>
                  </Box>

                  {bestScore !== null && (
                    <Box sx={{ mb:2 }}>
                      <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                        <Typography variant="caption" color="text.secondary">Best Score</Typography>
                        <Typography variant="caption" fontWeight={700}>{bestScore}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={bestScore}
                        sx={{ height:6, borderRadius:3,
                          '& .MuiLinearProgress-bar':{ bgcolor: passed ? '#00897b' : '#e65100' } }}/>
                      <Typography variant="caption" color="text.secondary">
                        Attempted {myAttempts.length} time{myAttempts.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  )}

                  {q.dueDate && (
                    <Box sx={{ display:'flex', alignItems:'center', gap:0.5, mb:1.5 }}>
                      <Typography variant="caption"
                        sx={{ color: new Date(q.dueDate) < new Date() ? '#EF4444' : '#6B7280',
                          fontWeight: new Date(q.dueDate) < new Date() ? 700 : 400 }}>
                        {new Date(q.dueDate) < new Date() ? '⚠️ Deadline: ' : '📅 Due: '}
                        {new Date(q.dueDate).toLocaleDateString('en-PK',{ day:'numeric', month:'short' })}
                      </Typography>
                    </Box>
                  )}
                  <Button variant={passed ? 'outlined' : 'contained'} fullWidth
                    sx={{ mt:'auto', bgcolor: passed ? 'transparent' : '#1a237e',
                      borderColor:'#1a237e', color: passed ? '#1a237e' : '#fff' }}
                    onClick={() => startQuiz(q)}>
                    {passed ? 'Retake Quiz' : myAttempts.length > 0 ? 'Retry' : 'Start Quiz'}
                  </Button>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
