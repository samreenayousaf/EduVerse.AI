import React, { useEffect, useState } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Button, Chip, CircularProgress, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Alert, Tabs, Tab,
  FormControl, InputLabel, Select,
} from '@mui/material';
import { Add, Grade, Visibility, Warning, AccessTime } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { courseAPI, assignAPI } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' });
}
function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-PK', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true });
}
function lateByLabel(dueDate, submittedAt) {
  if (!submittedAt) return null;
  const diff = new Date(submittedAt) - new Date(dueDate);
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d late`;
  return `${hours}h late`;
}

export default function InstructorAssignments() {
  const { mode }      = useThemeMode();
  const isDark        = mode === 'dark';
  const surface       = isDark ? '#1F2937' : '#fff';
  const border        = isDark ? '#374151' : '#E5E7EB';
  const txt           = isDark ? '#F9FAFB' : '#111827';
  const sub           = isDark ? '#9CA3AF' : '#6B7280';
  const hover         = isDark ? '#374151' : '#F3F4F6';

  const [courses,     setCourses]     = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState(0); // 0=list, 1=submissions
  const [selectedA,   setSelectedA]   = useState(null); // assignment for submissions
  const [submissions, setSubmissions] = useState([]);
  const [subLoading,  setSubLoading]  = useState(false);
  const [gradeDialog, setGradeDialog] = useState(null); // submission to grade
  const [gradeForm,   setGradeForm]   = useState({ grade:'', feedback:'' });
  const [grading,     setGrading]     = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [form, setForm] = useState({
    courseId:'', title:'', description:'', dueDate:'', totalPoints:100, allowLate:true, weekNumber:1
  });
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const cRes = await courseAPI.getMyCourses();
      setCourses(cRes.data || []);
      const allAssign = [];
      for (const c of (cRes.data || [])) {
        const cId = c._id || c.id;
        try {
          const aRes = await assignAPI.getByCourse(cId);
          (aRes.data || []).forEach(a => allAssign.push({ ...a, courseTitle: c.title }));
        } catch {}
      }
      setAssignments(allAssign);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleViewSubmissions = async (assignment) => {
    setSelectedA(assignment);
    setTab(1);
    setSubLoading(true);
    try {
      const res = await assignAPI.getSubmissions(assignment._id);
      setSubmissions(res.data || []);
    } catch { toast.error('Failed to load submissions'); }
    finally { setSubLoading(false); }
  };

  const handleGrade = async () => {
    if (!gradeForm.grade && gradeForm.grade !== 0) return toast.error('Enter a grade');
    setGrading(true);
    try {
      await assignAPI.grade(gradeDialog.assignmentId, gradeDialog._id, {
        grade: Number(gradeForm.grade),
        feedback: gradeForm.feedback,
      });
      toast.success('Graded!');
      setGradeDialog(null);
      setGradeForm({ grade:'', feedback:'' });
      // Reload submissions
      const res = await assignAPI.getSubmissions(selectedA._id);
      setSubmissions(res.data || []);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setGrading(false); }
  };

  const handleCreate = async () => {
    if (!form.courseId || !form.title || !form.dueDate)
      return toast.error('Course, title and due date required');
    setSaving(true);
    try {
      await assignAPI.create(form.courseId, {
        title: form.title,
        description: form.description,
        dueDate: form.dueDate,
        totalPoints: Number(form.totalPoints) || 100,
        allowLate: form.allowLate,
        weekNumber: Number(form.weekNumber) || 1,
      });
      toast.success('Assignment created!');
      setCreateDialog(false);
      setForm({ courseId:'', title:'', description:'', dueDate:'', totalPoints:100, allowLate:true, weekNumber:1 });
      loadAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const statusColor = { submitted:'info', graded:'success', late:'warning' };

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <CircularProgress size={48}/>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color:txt }}>Assignments</Typography>
          
        </Box>
        <Button variant="contained" startIcon={<Add/>} onClick={() => setCreateDialog(true)}
          sx={{ bgcolor: isDark?'#374151':'#1F2937', color:'#fff', borderRadius:2,
            '&:hover':{ bgcolor: isDark?'#4B5563':'#111827' } }}>
          New Assignment
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom:`1px solid ${border}`, mb:3 }}>
        <Tabs value={tab} onChange={(_,v) => setTab(v)}
          sx={{ '& .MuiTab-root':{ color:sub, fontWeight:600, textTransform:'none' },
            '& .Mui-selected':{ color:txt },
            '& .MuiTabs-indicator':{ bgcolor:txt } }}>
          <Tab label="All Assignments"/>
          {selectedA && <Tab label={`Submissions — ${selectedA.title}`}/>}
        </Tabs>
      </Box>

      {/* TAB 0: Assignments list */}
      {tab === 0 && (
        <Card sx={{ bgcolor:surface, border:`1px solid ${border}`, borderRadius:3, boxShadow:'none' }}>
          {assignments.length === 0 ? (
            <Box sx={{ p:6, textAlign:'center' }}>
              <Typography sx={{ color:sub }}>No assignments yet. Create your first!</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ '& th':{ fontWeight:700, color:sub, fontSize:'0.78rem', bgcolor:hover } }}>
                  <TableCell>Assignment</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Submissions</TableCell>
                  <TableCell>Graded</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map(a => {
                  const subs   = a.submissions || [];
                  const graded = subs.filter(s => s.grade != null).length;
                  const isOver = new Date() > new Date(a.dueDate);
                  return (
                    <TableRow key={a._id} sx={{ '&:hover':{ bgcolor:hover }, '&:last-child td':{ border:0 } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} sx={{ color:txt }}>{a.title}</Typography>
                        <Typography variant="caption" sx={{ color:sub }}>{a.totalPoints} pts</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={a.courseTitle||a.courseName} size="small" variant="outlined"
                          sx={{ fontSize:'0.68rem', color:sub }}/>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption"
                          sx={{ color: isOver ? '#EF4444' : sub, fontWeight: isOver ? 700 : 400 }}>
                          {formatDate(a.dueDate)}
                          {isOver && ' (Overdue)'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={subs.length} size="small"
                          sx={{ bgcolor: subs.length ? '#ECFDF5' : hover,
                            color: subs.length ? '#10b981' : sub, fontWeight:700 }}/>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color:sub }}>
                          {graded}/{subs.length}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<Visibility sx={{ fontSize:14 }}/>}
                          onClick={() => handleViewSubmissions(a)}
                          sx={{ fontSize:'0.72rem', color:sub, border:`1px solid ${border}`,
                            borderRadius:1.5, '&:hover':{ color:txt, borderColor:txt } }}>
                          View Submissions
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* TAB 1: Submissions */}
      {tab === 1 && selectedA && (
        <Card sx={{ bgcolor:surface, border:`1px solid ${border}`, borderRadius:3, boxShadow:'none' }}>
          {subLoading ? (
            <Box sx={{ p:6, textAlign:'center' }}><CircularProgress/></Box>
          ) : submissions.length === 0 ? (
            <Box sx={{ p:6, textAlign:'center' }}>
              <Typography sx={{ color:sub }}>No submissions yet.</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ '& th':{ fontWeight:700, color:sub, fontSize:'0.78rem', bgcolor:hover } }}>
                  <TableCell>Student</TableCell>
                  <TableCell>Submitted At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Answer</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map(s => {
                  const late = lateByLabel(selectedA.dueDate, s.submittedAt);
                  return (
                    <TableRow key={s._id} sx={{ '&:hover':{ bgcolor:hover }, '&:last-child td':{ border:0 } }}>
                      <TableCell>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                          <Avatar sx={{ width:30, height:30, bgcolor: isDark?'#374151':'#E5E7EB',
                            fontSize:12, fontWeight:700, color:txt }}>
                            {(s.studentName||'S')[0].toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600} sx={{ color:txt }}>
                            {s.studentName || 'Student'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color:sub }}>
                          {formatDateTime(s.submittedAt)}
                        </Typography>
                        {late && (
                          <Box sx={{ display:'flex', alignItems:'center', gap:0.3, mt:0.3 }}>
                            <Warning sx={{ fontSize:12, color:'#EF4444' }}/>
                            <Typography variant="caption" sx={{ color:'#EF4444', fontWeight:700 }}>
                              {late}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={s.status} size="small"
                          color={statusColor[s.status]||'default'}
                          sx={{ fontWeight:700, textTransform:'capitalize', fontSize:'0.68rem' }}/>
                      </TableCell>
                      <TableCell sx={{ maxWidth:200 }}>
                        <Typography variant="caption" sx={{ color:sub,
                          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                          {s.content || (s.fileUrl ? `File: ${s.fileName}` : '—')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {s.grade != null
                          ? <Chip label={`${s.grade}/${selectedA.totalPoints}`} size="small"
                              color="success" sx={{ fontWeight:700 }}/>
                          : <Typography variant="caption" sx={{ color:sub }}>Not graded</Typography>
                        }
                      </TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<Grade sx={{ fontSize:14 }}/>}
                          onClick={() => { setGradeDialog({ ...s, assignmentId: selectedA._id }); setGradeForm({ grade: s.grade||'', feedback: s.feedback||'' }); }}
                          sx={{ fontSize:'0.72rem', color: isDark?'#9CA3AF':'#6B7280',
                            border:`1px solid ${border}`, borderRadius:1.5,
                            '&:hover':{ color:txt, borderColor:txt } }}>
                          {s.grade != null ? 'Re-grade' : 'Grade'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Grade Dialog */}
      {gradeDialog && (
        <Dialog open onClose={() => setGradeDialog(null)} maxWidth="sm" fullWidth
          PaperProps={{ sx:{ borderRadius:3, bgcolor:surface } }}>
          <DialogTitle fontWeight={700} sx={{ color:txt }}>
            Grade — {gradeDialog.studentName}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ p:2, bgcolor:hover, borderRadius:2, mb:2 }}>
              <Typography variant="caption" sx={{ color:sub, display:'block', mb:0.5 }}>Submission:</Typography>
              <Typography variant="body2" sx={{ color:txt }}>{gradeDialog.content || `File: ${gradeDialog.fileName}`}</Typography>
            </Box>
            <TextField label={`Grade (out of ${selectedA?.totalPoints})`} type="number"
              value={gradeForm.grade} onChange={e=>setGradeForm(f=>({...f,grade:e.target.value}))}
              fullWidth sx={{ mb:2 }} inputProps={{ min:0, max:selectedA?.totalPoints }}/>
            <TextField label="Feedback (optional)" multiline rows={3}
              value={gradeForm.feedback} onChange={e=>setGradeForm(f=>({...f,feedback:e.target.value}))}
              fullWidth placeholder="Write feedback for the student..."/>
          </DialogContent>
          <DialogActions sx={{ px:3, pb:3 }}>
            <Button onClick={() => setGradeDialog(null)} variant="outlined">Cancel</Button>
            <Button onClick={handleGrade} variant="contained" disabled={grading}
              sx={{ bgcolor: isDark?'#374151':'#1F2937', color:'#fff', borderRadius:2,
                '&:hover':{ bgcolor: isDark?'#4B5563':'#111827' } }}>
              {grading ? <CircularProgress size={18} color="inherit"/> : 'Save Grade'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Create Assignment Dialog */}
      {createDialog && (
        <Dialog open onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx:{ borderRadius:3, bgcolor:surface } }}>
          <DialogTitle fontWeight={700} sx={{ color:txt }}>New Assignment</DialogTitle>
          <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2.5, pt:'20px !important' }}>
            <FormControl fullWidth>
              <InputLabel>Select Course *</InputLabel>
              <Select value={form.courseId} label="Select Course *"
                onChange={e=>setForm(f=>({...f,courseId:e.target.value}))}>
                {courses.map(c=>(
                  <MenuItem key={c._id||c.id} value={c._id||c.id}>{c.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Title *" value={form.title} fullWidth
              onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
            <TextField label="Description" value={form.description} fullWidth multiline rows={3}
              onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Due Date *" type="datetime-local" value={form.dueDate}
                  onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}
                  fullWidth InputLabelProps={{ shrink:true }}/>
              </Grid>
              <Grid item xs={6}>
                <TextField label="Total Points" type="number" value={form.totalPoints}
                  onChange={e=>setForm(f=>({...f,totalPoints:e.target.value}))} fullWidth/>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Week Number *</InputLabel>
                  <Select value={form.weekNumber} label="Week Number *"
                    onChange={e=>setForm(f=>({...f,weekNumber:e.target.value}))}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(w=>(
                      <MenuItem key={w} value={w}>Week {w}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <FormControl fullWidth size="small">
              <InputLabel>Allow Late Submissions</InputLabel>
              <Select value={form.allowLate} label="Allow Late Submissions"
                onChange={e=>setForm(f=>({...f,allowLate:e.target.value}))}>
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px:3, pb:3 }}>
            <Button onClick={() => setCreateDialog(false)} variant="outlined">Cancel</Button>
            <Button onClick={handleCreate} variant="contained" disabled={saving}
              sx={{ bgcolor: isDark?'#374151':'#1F2937', color:'#fff', borderRadius:2,
                '&:hover':{ bgcolor: isDark?'#4B5563':'#111827' } }}>
              {saving ? <CircularProgress size={18} color="inherit"/> : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
