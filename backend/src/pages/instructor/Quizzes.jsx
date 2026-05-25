import React, { useEffect, useState } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Button, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, FormControl, InputLabel, Select,
  Grid,
} from '@mui/material';
import { Add, Delete, Quiz as QuizIcon, Timer, People } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { courseAPI, quizAPI } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';

const emptyQ = () => ({ question:'', options:['','','',''], correctIndex:0 });

export default function InstructorQuizzes() {
  const { mode }  = useThemeMode();
  const isDark    = mode === 'dark';
  const surface   = isDark ? '#1F2937' : '#fff';
  const border    = isDark ? '#374151' : '#E5E7EB';
  const txt       = isDark ? '#F9FAFB' : '#111827';
  const sub       = isDark ? '#9CA3AF' : '#6B7280';
  const hover     = isDark ? '#374151' : '#F3F4F6';

  const [courses,   setCourses]   = useState([]);
  const [quizzes,   setQuizzes]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [open,      setOpen]      = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState({ courseId:'', title:'', timeLimit:30, passingScore:60, dueDate:'' });
  const [questions, setQuestions] = useState([emptyQ()]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const cRes = await courseAPI.getMyCourses();
      setCourses(cRes.data || []);
      const allQuizzes = [];
      for (const c of (cRes.data || [])) {
        const cId = c._id || c.id;
        try {
          const qRes = await quizAPI.getByCourse(cId);
          (qRes.data || []).forEach(q => allQuizzes.push({ ...q, courseTitle: c.title }));
        } catch {}
      }
      setQuizzes(allQuizzes);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const addQuestion    = ()         => setQuestions(qs => [...qs, emptyQ()]);
  const removeQuestion = (i)        => setQuestions(qs => qs.filter((_,j)=>j!==i));
  const setQField      = (i,k,v)   => setQuestions(qs => qs.map((q,j)=>j===i?{...q,[k]:v}:q));
  const setOption      = (i,oi,v)  => setQuestions(qs => qs.map((q,j)=>j===i?{...q,options:q.options.map((o,k)=>k===oi?v:o)}:q));

  const handleCreate = async () => {
    if (!form.courseId || !form.title) return toast.error('Course and title required');
    if (questions.some(q=>!q.question.trim()||q.options.some(o=>!o.trim())))
      return toast.error('Fill all questions and options');
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        timeLimit: Number(form.timeLimit) || 30,
        passingScore: Number(form.passingScore) || 60,
        dueDate: form.dueDate || null,
        questions: questions.map(q => ({
          question: q.question,
          options: q.options.map((o, i) => ({ text: o, isCorrect: i === q.correctIndex })),
          points: 1,
        })),
      };
      await quizAPI.create(form.courseId, payload);
      toast.success('Quiz created!');
      setOpen(false);
      setForm({ courseId:'', title:'', timeLimit:30, passingScore:60, dueDate:'' });
      setQuestions([emptyQ()]);
      loadAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <CircularProgress size={48}/>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color:txt }}>Quizzes</Typography>
          <Typography variant="body2" sx={{ color:sub, mt:0.5 }}>
            {quizzes.length} total across {courses.length} courses
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add/>} onClick={() => setOpen(true)}
          sx={{ bgcolor: isDark?'#374151':'#1F2937', color:'#fff', borderRadius:2,
            '&:hover':{ bgcolor: isDark?'#4B5563':'#111827' } }}>
          New Quiz
        </Button>
      </Box>

      <Card sx={{ bgcolor:surface, border:`1px solid ${border}`, borderRadius:3, boxShadow:'none' }}>
        {quizzes.length === 0 ? (
          <Box sx={{ p:6, textAlign:'center' }}>
            <QuizIcon sx={{ fontSize:48, color:border, mb:1 }}/>
            <Typography sx={{ color:sub }}>No quizzes yet. Create your first!</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ '& th':{ fontWeight:700, color:sub, fontSize:'0.78rem', bgcolor:hover } }}>
                <TableCell>Quiz</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Questions</TableCell>
                <TableCell>Time Limit</TableCell>
                <TableCell>Passing</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Attempts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizzes.map(q => (
                <TableRow key={q._id} sx={{ '&:hover':{ bgcolor:hover }, '&:last-child td':{ border:0 } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} sx={{ color:txt }}>{q.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={q.courseTitle||q.courseName} size="small" variant="outlined"
                      sx={{ fontSize:'0.68rem', color:sub }}/>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color:sub }}>{q.questions?.length||0}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                      <Timer sx={{ fontSize:14, color:sub }}/>
                      <Typography variant="caption" sx={{ color:sub }}>{q.timeLimit}m</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={`${q.passingScore}%`} size="small"
                      sx={{ bgcolor: isDark?'#14532d30':'#F0FDF4', color:'#16A34A', fontWeight:700, fontSize:'0.68rem' }}/>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: q.dueDate && new Date(q.dueDate) < new Date() ? '#EF4444' : sub }}>
                      {q.dueDate ? new Date(q.dueDate).toLocaleDateString('en-PK',{ day:'numeric', month:'short' }) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                      <People sx={{ fontSize:14, color:sub }}/>
                      <Typography variant="body2" sx={{ color:sub }}>{q.attempts?.length||0}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create Quiz Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx:{ borderRadius:3, bgcolor:surface } }}>
        <DialogTitle fontWeight={700} sx={{ color:txt }}>Create New Quiz</DialogTitle>
        <DialogContent sx={{ pt:'16px !important' }}>
          <Grid container spacing={2} sx={{ mb:3 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Course *</InputLabel>
                <Select value={form.courseId} label="Course *"
                  onChange={e=>setForm(f=>({...f,courseId:e.target.value}))}>
                  {courses.map(c=><MenuItem key={c._id||c.id} value={c._id||c.id}>{c.title}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Quiz Title *" value={form.title} fullWidth
                onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
            </Grid>
            <Grid item xs={4}>
              <TextField label="Time Limit (min)" type="number" value={form.timeLimit}
                onChange={e=>setForm(f=>({...f,timeLimit:e.target.value}))} fullWidth/>
            </Grid>
            <Grid item xs={4}>
              <TextField label="Passing Score (%)" type="number" value={form.passingScore}
                onChange={e=>setForm(f=>({...f,passingScore:e.target.value}))} fullWidth/>
            </Grid>
            <Grid item xs={4}>
              <TextField label="Due Date (optional)" type="datetime-local" value={form.dueDate}
                onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}
                fullWidth InputLabelProps={{ shrink:true }}/>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" fontWeight={700} sx={{ color:txt, mb:2 }}>Questions</Typography>
          {questions.map((q, qi) => (
            <Card key={qi} sx={{ p:2.5, mb:2, bgcolor:hover, border:`1px solid ${border}`, borderRadius:2, boxShadow:'none' }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color:txt }}>Q{qi+1}</Typography>
                {questions.length > 1 && (
                  <IconButton size="small" color="error" onClick={() => removeQuestion(qi)}>
                    <Delete fontSize="small"/>
                  </IconButton>
                )}
              </Box>
              <TextField label="Question *" value={q.question} fullWidth sx={{ mb:2 }}
                onChange={e=>setQField(qi,'question',e.target.value)}/>
              {q.options.map((opt, oi) => (
                <Box key={oi} sx={{ display:'flex', alignItems:'center', gap:1, mb:1 }}>
                  <Box onClick={() => setQField(qi,'correctIndex',oi)}
                    sx={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${q.correctIndex===oi?'#10b981':border}`,
                      bgcolor: q.correctIndex===oi?'#10b981':'transparent', cursor:'pointer', flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {q.correctIndex===oi && <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:'#fff' }}/>}
                  </Box>
                  <TextField label={`Option ${oi+1}${q.correctIndex===oi?' (Correct)':''}`}
                    value={opt} size="small" fullWidth
                    onChange={e=>setOption(qi,oi,e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root':{ bgcolor:surface,
                      borderColor: q.correctIndex===oi ? '#10b981' : border } }}/>
                </Box>
              ))}
            </Card>
          ))}
          <Button startIcon={<Add/>} onClick={addQuestion} variant="outlined" size="small"
            sx={{ borderColor:border, color:sub, borderRadius:2, '&:hover':{ color:txt, borderColor:txt } }}>
            Add Question
          </Button>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:3 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={saving}
            sx={{ bgcolor: isDark?'#374151':'#1F2937', color:'#fff', borderRadius:2,
              '&:hover':{ bgcolor: isDark?'#4B5563':'#111827' } }}>
            {saving ? <CircularProgress size={18} color="inherit"/> : 'Create Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
