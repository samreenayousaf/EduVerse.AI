import React, { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Button, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, LinearProgress, Alert,
} from '@mui/material';
import {
  Assignment, CheckCircle, Schedule, Upload, Visibility,
  AccessTime, Warning,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { assignAPI, enrollAPI } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';

const statusColor = {
  submitted: 'info', graded: 'success', late: 'warning', pending: 'default',
};

function getDaysLeft(dueDate) {
  const diff = new Date(dueDate) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0)   return { text: 'Overdue', color: '#d32f2f', isLate: true };
  if (days === 0) return { text: 'Due today', color: '#e65100', isLate: false };
  if (days <= 3)  return { text: `${days}d left`, color: '#e65100', isLate: false };
  return { text: `${days}d left`, color: '#00897b', isLate: false };
}

function formatSubmitTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function lateByLabel(dueDate, submittedAt) {
  if (!submittedAt) return null;
  const diff = new Date(submittedAt) - new Date(dueDate);
  if (diff <= 0) return null;
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `Submitted ${days} day${days > 1 ? 's' : ''} late`;
  return `Submitted ${hours} hour${hours > 1 ? 's' : ''} late`;
}

export default function StudentAssignments() {
  const { mode }         = useThemeMode();
  const isDark           = mode === 'dark';
  const surface          = isDark ? '#1F2937' : '#fff';
  const border           = isDark ? '#374151' : '#E5E7EB';
  const txt              = isDark ? '#F9FAFB' : '#111827';
  const sub              = isDark ? '#9CA3AF' : '#6B7280';
  const hover            = isDark ? '#374151' : '#F3F4F6';

  const [enrollments,   setEnrollments]   = useState([]);
  const [assignments,   setAssignments]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [submitDialog,  setSubmitDialog]  = useState(null);
  const [viewDialog,    setViewDialog]    = useState(null);
  const [content,       setContent]       = useState('');
  const [file,          setFile]          = useState(null);
  const [submitting,    setSubmitting]    = useState(false);

  const loadAll = async (enrs) => {
    const allAssign = [];
    const list = enrs || enrollments;
    for (const enr of list) {
      const cId = enr.courseId?._id || enr.courseId;
      if (!cId) continue;
      try {
        const aRes = await assignAPI.getByCourse(cId);
        allAssign.push(...(aRes.data || []));
      } catch {}
    }
    setAssignments(allAssign);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const eRes = await enrollAPI.getMyEnroll();
        setEnrollments(eRes.data);
        await loadAll(eRes.data);
      } catch { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!content.trim() && !file) return toast.error('Write an answer or attach a file');
    setSubmitting(true);
    try {
      await assignAPI.submit(submitDialog._id, {
        content: content || (file ? `File: ${file.name}` : ''),
        fileUrl:  file ? URL.createObjectURL(file) : '',
        fileName: file?.name || '',
      });
      toast.success('Assignment submitted! ✅');
      setSubmitDialog(null);
      setContent(''); setFile(null);
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <CircularProgress size={48}/>
    </Box>
  );

  // const pending   = assignments.filter(a => !a.mySubmission);
  // const submitted = assignments.filter(a => a.mySubmission);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb:1, color: isDark?'#F9FAFB':'#111827' }}>
        Assignments
      </Typography>
      {/* <Typography sx={{ color:sub, mb:3 }}>
        {pending.length} pending · {submitted.length} submitted
      </Typography> */}

      {assignments.length === 0 ? (
        <Card sx={{ p:6, textAlign:'center', borderRadius:3, bgcolor:surface,
          border:`1px solid ${border}`, boxShadow:'none' }}>
          <Assignment sx={{ fontSize:64, color:border, mb:2 }}/>
          <Typography sx={{ color:sub }}>No assignments yet.</Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {assignments.map(a => {
            const mySub  = a.mySubmission;
            const due    = getDaysLeft(a.dueDate);
            const isLate = new Date() > new Date(a.dueDate);
            const lateBy = mySub ? lateByLabel(a.dueDate, mySub.submittedAt) : null;

            return (
              <Grid item xs={12} md={6} key={a._id}>
                <Card sx={{ p:3, borderRadius:3, bgcolor:surface, boxShadow:'none',
                  borderLeft:`4px solid ${
                    mySub?.grade != null ? '#00897b'
                    : isLate && !mySub ? '#d32f2f'
                    : lateBy ? '#f59e0b'
                    : `${border}`
                  }`,
                  border:`1px solid ${border}` }}>

                  <Box sx={{ display:'flex', justifyContent:'space-between', mb:1, flexWrap:'wrap', gap:1 }}>
                    <Chip label={a.courseName} size="small" variant="outlined"
                      sx={{ fontSize:'0.68rem', color:sub, borderColor:border }}/>
                    {mySub ? (
                      <Box sx={{ display:'flex', gap:0.5, alignItems:'center' }}>
                        {lateBy && (
                          <Chip icon={<Warning sx={{ fontSize:'12px !important', color:'#EF4444 !important' }}/>}
                            label={lateBy} size="small"
                            sx={{ bgcolor:'#FEE2E2', color:'#EF4444', fontWeight:700, fontSize:'0.65rem' }}/>
                        )}
                        <Chip
                          label={mySub.grade != null ? `Graded: ${mySub.grade}/${a.totalPoints}` : mySub.status}
                          size="small"
                          color={statusColor[mySub.status] || 'default'}
                          sx={{ fontWeight:700 }}/>
                      </Box>
                    ) : (
                      <Typography variant="caption" fontWeight={700}
                        sx={{ color: due.color, display:'flex', alignItems:'center', gap:0.5 }}>
                        {isLate && <Warning sx={{ fontSize:14 }}/>}
                        {due.text}
                      </Typography>
                    )}
                  </Box>

                  <Typography variant="subtitle1" fontWeight={700} sx={{ color:txt }} gutterBottom>
                    {a.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color:sub, mb:2,
                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {a.description}
                  </Typography>

                  {/* Grade bar */}
                  {mySub?.grade != null && (
                    <Box sx={{ mb:2 }}>
                      <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                        <Typography variant="caption" sx={{ color:sub }}>Score</Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color:txt }}>
                          {mySub.grade}/{a.totalPoints} ({Math.round(mySub.grade/a.totalPoints*100)}%)
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={Math.round(mySub.grade/a.totalPoints*100)}
                        sx={{ height:6, borderRadius:3,
                          '& .MuiLinearProgress-bar':{ bgcolor: mySub.grade/a.totalPoints>=0.6?'#00897b':'#e65100' }}}/>
                      {mySub.feedback && (
                        <Alert severity="info" sx={{ mt:1.5, borderRadius:2, fontSize:'0.8rem' }}>
                          <strong>Feedback:</strong> {mySub.feedback}
                        </Alert>
                      )}
                    </Box>
                  )}

                  <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', mb:2 }}>
                    <Typography variant="caption" sx={{ color:sub }}>
                      Due: {new Date(a.dueDate).toLocaleDateString('en-PK')}
                    </Typography>
                    <Typography variant="caption" sx={{ color:sub }}>·</Typography>
                    <Typography variant="caption" sx={{ color:sub }}>{a.totalPoints} pts</Typography>
                    {mySub?.submittedAt && (
                      <>
                        <Typography variant="caption" sx={{ color:sub }}>·</Typography>
                        <Typography variant="caption"
                          sx={{ color: lateBy ? '#EF4444' : '#10b981', fontWeight:600,
                            display:'flex', alignItems:'center', gap:0.3 }}>
                          <AccessTime sx={{ fontSize:11 }}/>
                          Submitted: {formatSubmitTime(mySub.submittedAt)}
                        </Typography>
                      </>
                    )}
                  </Box>

                  <Box sx={{ display:'flex', gap:1 }}>
                    {mySub ? (
                      <Button size="small" variant="outlined" startIcon={<Visibility/>}
                        onClick={() => setViewDialog({ assignment: a, submission: mySub })}
                        sx={{ borderColor:border, color:sub, borderRadius:2,
                          '&:hover':{ borderColor:txt, color:txt } }}>
                        View Submission
                      </Button>
                    ) : (
                      <Button size="small" variant="contained" startIcon={<Upload/>}
                        disabled={isLate && !a.allowLate}
                        onClick={() => { setSubmitDialog(a); setContent(''); setFile(null); }}
                        sx={{ bgcolor: isDark?'#374151':'#1F2937', color:'#fff', borderRadius:2,
                          '&:hover':{ bgcolor: isDark?'#4B5563':'#111827' } }}>
                        {isLate && !a.allowLate ? 'Deadline Passed' : 'Submit Assignment'}
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Submit Dialog */}
      {submitDialog && (
        <Dialog open onClose={() => setSubmitDialog(null)} maxWidth="sm" fullWidth
          PaperProps={{ sx:{ borderRadius:3, bgcolor:surface } }}>
          <DialogTitle fontWeight={700} sx={{ color:txt }}>{submitDialog.title}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color:sub, mb:2 }}>
              {submitDialog.description}
            </Typography>
            <TextField label="Your Answer / Solution" multiline rows={5} fullWidth
              value={content} onChange={e => setContent(e.target.value)}
              placeholder="Write your solution, paste a GitHub link, Google Docs link, etc..."
              sx={{ mb:2, '& .MuiOutlinedInput-root':{ borderRadius:2 } }}/>
            <Button component="label" variant="outlined" startIcon={<Upload/>}
              sx={{ borderStyle:'dashed', width:'100%', py:1.5, borderRadius:2 }}>
              {file ? `${file.name} (${(file.size/1024).toFixed(0)} KB)` : 'Attach File (PDF, DOCX, max 10MB)'}
              <input type="file" hidden accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt"
                onChange={e => {
                  const f = e.target.files[0];
                  if (f && f.size > 10*1024*1024) { toast.error('File must be under 10MB'); return; }
                  setFile(f);
                }}/>
            </Button>
          </DialogContent>
          <DialogActions sx={{ px:3, pb:3 }}>
            <Button onClick={() => setSubmitDialog(null)} variant="outlined">Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={submitting}
              sx={{ bgcolor: isDark?'#374151':'#1F2937', color:'#fff', borderRadius:2,
                '&:hover':{ bgcolor: isDark?'#4B5563':'#111827' } }}>
              {submitting ? <CircularProgress size={18} color="inherit"/> : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* View Submission Dialog */}
      {viewDialog && (
        <Dialog open onClose={() => setViewDialog(null)} maxWidth="sm" fullWidth
          PaperProps={{ sx:{ borderRadius:3, bgcolor:surface } }}>
          <DialogTitle fontWeight={700} sx={{ color:txt }}>
            {viewDialog.assignment.title}
            <Chip label={viewDialog.submission.status} size="small"
              color={statusColor[viewDialog.submission.status]||'default'}
              sx={{ ml:1.5, fontWeight:700 }}/>
          </DialogTitle>
          <DialogContent>
            {/* Submission time */}
            <Box sx={{ p:2, bgcolor:hover, borderRadius:2, mb:2 }}>
              <Typography variant="caption" sx={{ color:sub, display:'block', mb:0.5 }}>
                <strong>Submitted at:</strong> {formatSubmitTime(viewDialog.submission.submittedAt)}
              </Typography>
              {lateByLabel(viewDialog.assignment.dueDate, viewDialog.submission.submittedAt) && (
                <Typography variant="caption"
                  sx={{ color:'#EF4444', fontWeight:700, display:'flex', alignItems:'center', gap:0.5 }}>
                  <Warning sx={{ fontSize:12 }}/>
                  {lateByLabel(viewDialog.assignment.dueDate, viewDialog.submission.submittedAt)}
                </Typography>
              )}
            </Box>

            <Typography variant="subtitle2" sx={{ color:txt }} gutterBottom>Your Submission:</Typography>
            <Box sx={{ p:2, bgcolor:hover, borderRadius:2, mb:2 }}>
              <Typography variant="body2" sx={{ color:txt }}>{viewDialog.submission.content}</Typography>
            </Box>
            {viewDialog.submission.grade != null && (
              <Alert severity="success" sx={{ borderRadius:2 }}>
                <strong>Grade: {viewDialog.submission.grade}/{viewDialog.assignment.totalPoints}</strong>
                {viewDialog.submission.feedback && (
                  <Typography variant="body2" sx={{ mt:0.5 }}>
                    Feedback: {viewDialog.submission.feedback}
                  </Typography>
                )}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px:3, pb:3 }}>
            <Button onClick={() => setViewDialog(null)} variant="contained"
              sx={{ bgcolor: isDark?'#374151':'#1F2937', color:'#fff', borderRadius:2 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
