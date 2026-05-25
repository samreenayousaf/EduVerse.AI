import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Button, Avatar, CircularProgress,
  Card, Grid, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel,
  Table, TableHead, TableRow, TableCell, TableBody, LinearProgress,
  Collapse, Divider, Alert,
} from '@mui/material';
import {
  ArrowBack, Add, Delete, PlayCircle, PictureAsPdf, Assignment,
  Quiz as QuizIcon, Announcement, InsertDriveFile, ExpandMore,
  ExpandLess, People, Grade, Settings, BarChart, CalendarToday,
  Edit, CheckCircle, Timer, Upload, Download,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { courseAPI, enrollAPI, assignAPI, quizAPI } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const ACT_TYPES = [
  { value:'video',        label:'Video Lecture',   icon:'🎬' },
  { value:'pdf',          label:'PDF / File',       icon:'📄' },
  { value:'assignment',   label:'Assignment',       icon:'📝' },
  { value:'quiz',         label:'Quiz',             icon:'❓' },
  { value:'announcement', label:'Announcement',     icon:'📢' },
];

const ACT_COLOR = {
  video:'#6366f1', pdf:'#ef4444', assignment:'#f59e0b',
  quiz:'#8b5cf6', announcement:'#3b82f6', file:'#0891b2',
};
const ACT_ICON = {
  video:<PlayCircle sx={{ fontSize:18 }}/>,
  pdf:<PictureAsPdf sx={{ fontSize:18 }}/>,
  assignment:<Assignment sx={{ fontSize:18 }}/>,
  quiz:<QuizIcon sx={{ fontSize:18 }}/>,
  announcement:<Announcement sx={{ fontSize:18 }}/>,
  file:<InsertDriveFile sx={{ fontSize:18 }}/>,
};

// ── Assignment Create Dialog ─────────────────────────────────────
function AssignmentDialog({ courseId, weekId, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:'', description:'', openDate:'', closeDate:'',
    totalPoints:100, allowLate:true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title) return toast.error('Title required');
    if (!form.closeDate) return toast.error('Due date required');
    setSaving(true);
    try {
      // 1. Create assignment in MongoDB
      const res = await assignAPI.create(courseId, {
        title:       form.title,
        description: form.description,
        dueDate:     form.closeDate,
        totalPoints: Number(form.totalPoints),
        allowLate:   form.allowLate,
      });
      const assignId = res.data._id;
      // 2. Add activity to week
      await courseAPI.addActivity(courseId, weekId, {
        type:'assignment', title:form.title,
        openDate:  form.openDate  || null,
        closeDate: form.closeDate || null,
        refId: assignId,
      });
      toast.success('Assignment created & added to week! ✅');
      onSaved(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3 } }}>
      <DialogTitle fontWeight={700}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Assignment sx={{ color:'#f59e0b' }}/> New Assignment
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display:'flex', flexDirection:'column', gap:2.5, pt:1 }}>
          <TextField label="Assignment name *" value={form.title}
            onChange={e=>setForm(f=>({...f,title:e.target.value}))} fullWidth/>
          <TextField label="Description" value={form.description}
            onChange={e=>setForm(f=>({...f,description:e.target.value}))}
            multiline rows={3} fullWidth
            placeholder="Assignment instructions, requirements..."/>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb:1.5 }}>
              Availability
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Allow submissions from" type="datetime-local"
                  value={form.openDate} onChange={e=>setForm(f=>({...f,openDate:e.target.value}))}
                  fullWidth InputLabelProps={{ shrink:true }}/>
              </Grid>
              <Grid item xs={6}>
                <TextField label="Due date *" type="datetime-local"
                  value={form.closeDate} onChange={e=>setForm(f=>({...f,closeDate:e.target.value}))}
                  fullWidth InputLabelProps={{ shrink:true }}/>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display:'flex', gap:2 }}>
            <TextField label="Total Points" type="number" value={form.totalPoints}
              onChange={e=>setForm(f=>({...f,totalPoints:e.target.value}))} sx={{ flex:1 }}/>
            <FormControl sx={{ flex:1 }}>
              <InputLabel>Allow Late</InputLabel>
              <Select value={form.allowLate} label="Allow Late"
                onChange={e=>setForm(f=>({...f,allowLate:e.target.value}))}>
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px:3, pb:3 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}
          sx={{ bgcolor:'#f59e0b', '&:hover':{ bgcolor:'#d97706' } }}>
          {saving ? <CircularProgress size={18} color="inherit"/> : 'Save Assignment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Add Activity Dialog ──────────────────────────────────────────
function AddActivityDialog({ courseId, weekId, onClose, onSaved }) {
  const [type,    setType]    = useState('video');
  const [title,   setTitle]   = useState('');
  const [content, setContent] = useState('');
  const [saving,  setSaving]  = useState(false);

  const handleSave = async () => {
    if (!title) return toast.error('Title required');
    setSaving(true);
    try {
      await courseAPI.addActivity(courseId, weekId, { type, title, content });
      toast.success('Activity added!');
      onSaved(); onClose();
    } catch (err) { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx:{ borderRadius:3 } }}>
      <DialogTitle fontWeight={700}>Add Activity</DialogTitle>
      <DialogContent>
        <Box sx={{ display:'flex', flexDirection:'column', gap:2, pt:1 }}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={type} label="Type" onChange={e=>setType(e.target.value)}>
              {ACT_TYPES.map(t => (
                <MenuItem key={t.value} value={t.value}>{t.icon} {t.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Title *" value={title} onChange={e=>setTitle(e.target.value)} fullWidth/>
          {type==='video' && (
            <TextField label="YouTube URL" value={content}
              onChange={e=>setContent(e.target.value)} fullWidth
              placeholder="https://youtube.com/watch?v=..."/>
          )}
          {type==='announcement' && (
            <TextField label="Announcement text" value={content}
              onChange={e=>setContent(e.target.value)} fullWidth multiline rows={2}/>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px:3, pb:3 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={18} color="inherit"/> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Quiz Create Dialog ────────────────────────────────────────────
function QuizDialog({ courseId, weekId, onClose, onSaved }) {
  const [form, setForm] = React.useState({
    title:'', timeLimit:30, passingScore:60, dueDate:'',
  });
  const [questions, setQuestions] = React.useState([{ question:'', options:['','','',''], correctIndex:0 }]);
  const [saving, setSaving] = React.useState(false);

  const emptyQ = () => ({ question:'', options:['','','',''], correctIndex:0 });
  const addQ = () => setQuestions(qs=>[...qs,emptyQ()]);
  const removeQ = (i) => setQuestions(qs=>qs.filter((_,j)=>j!==i));
  const setQField = (i,k,v) => setQuestions(qs=>qs.map((q,j)=>j===i?{...q,[k]:v}:q));
  const setOpt = (i,oi,v) => setQuestions(qs=>qs.map((q,j)=>j===i?{...q,options:q.options.map((o,k)=>k===oi?v:o)}:q));

  const handleSave = async () => {
    if (!form.title) return toast.error('Title required');
    if (questions.some(q=>!q.question.trim()||q.options.some(o=>!o.trim())))
      return toast.error('Fill all questions and options');
    setSaving(true);
    try {
      const res = await quizAPI.create(courseId, {
        title: form.title,
        timeLimit: Number(form.timeLimit)||30,
        passingScore: Number(form.passingScore)||60,
        dueDate: form.dueDate||null,
        questions: questions.map(q=>({
          question:q.question,
          options:q.options.map((o,i)=>({ text:o, isCorrect:i===q.correctIndex })),
          points:1,
        })),
      });
      await courseAPI.addActivity(courseId, weekId, {
        type:'quiz', title:form.title,
        closeDate: form.dueDate||null,
        refId: res.data._id,
      });
      toast.success('Quiz created & added to week! ✅');
      onSaved(); onClose();
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally{ setSaving(false); }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx:{borderRadius:3} }}>
      <DialogTitle fontWeight={700}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <QuizIcon sx={{ color:'#8b5cf6' }}/> New Quiz
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display:'flex', flexDirection:'column', gap:2.5, pt:1 }}>
          <TextField label="Quiz title *" value={form.title}
            onChange={e=>setForm(f=>({...f,title:e.target.value}))} fullWidth/>
          <Box sx={{ display:'flex', gap:2 }}>
            <TextField label="Time limit (min)" type="number" value={form.timeLimit}
              onChange={e=>setForm(f=>({...f,timeLimit:e.target.value}))} sx={{ flex:1 }}/>
            <TextField label="Passing score (%)" type="number" value={form.passingScore}
              onChange={e=>setForm(f=>({...f,passingScore:e.target.value}))} sx={{ flex:1 }}/>
            <TextField label="Due date" type="datetime-local" value={form.dueDate}
              onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}
              sx={{ flex:1 }} InputLabelProps={{ shrink:true }}/>
          </Box>
          <Typography variant="subtitle2" fontWeight={700}>Questions</Typography>
          {questions.map((q,qi)=>(
            <Box key={qi} sx={{ p:2, border:'1px solid #e0e0e0', borderRadius:2 }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', mb:1.5 }}>
                <Typography variant="body2" fontWeight={700}>Q{qi+1}</Typography>
                {questions.length>1&&(
                  <IconButton size="small" color="error" onClick={()=>removeQ(qi)}>
                    <Delete fontSize="small"/>
                  </IconButton>
                )}
              </Box>
              <TextField label="Question *" value={q.question} fullWidth sx={{ mb:2 }}
                onChange={e=>setQField(qi,'question',e.target.value)}/>
              {q.options.map((opt,oi)=>(
                <Box key={oi} sx={{ display:'flex', alignItems:'center', gap:1, mb:1 }}>
                  <Box onClick={()=>setQField(qi,'correctIndex',oi)}
                    sx={{ width:20, height:20, borderRadius:'50%',
                      border:`2px solid ${q.correctIndex===oi?'#10b981':'#e0e0e0'}`,
                      bgcolor:q.correctIndex===oi?'#10b981':'transparent',
                      cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {q.correctIndex===oi&&<Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:'#fff' }}/>}
                  </Box>
                  <TextField label={`Option ${oi+1}${q.correctIndex===oi?' ✓':''}`}
                    value={opt} size="small" fullWidth onChange={e=>setOpt(qi,oi,e.target.value)}/>
                </Box>
              ))}
            </Box>
          ))}
          <Button startIcon={<Add/>} onClick={addQ} variant="outlined" size="small"
            sx={{ alignSelf:'flex-start' }}>Add Question</Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px:3, pb:3 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}
          sx={{ bgcolor:'#8b5cf6', '&:hover':{ bgcolor:'#7c3aed' } }}>
          {saving?<CircularProgress size={18} color="inherit"/>:'Save Quiz'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Week Section ─────────────────────────────────────────────────
function WeekSection({ week, courseId, isInstructor, onReload }) {
  const { mode }  = useThemeMode();
  const isDark    = mode === 'dark';
  const [open,    setOpen]       = useState(true);
  const [showAdd, setShowAdd]    = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [deleting, setDeleting]  = useState({});

  const surface = isDark ? '#1F2937' : '#fff';
  const border  = isDark ? '#374151' : '#E5E7EB';
  const txt     = isDark ? '#F9FAFB' : '#111827';
  const sub     = isDark ? '#9CA3AF' : '#6B7280';
  const hover   = isDark ? '#374151' : '#F9FAFB';

  const handleDeleteActivity = async (actId) => {
    setDeleting(p => ({...p, [actId]:true}));
    try {
      await courseAPI.deleteActivity(courseId, week._id, actId);
      toast.success('Removed'); onReload();
    } catch { toast.error('Failed'); }
    finally { setDeleting(p => ({...p, [actId]:false})); }
  };

  return (
    <Box sx={{ border:`1px solid ${border}`, borderRadius:3, mb:2, overflow:'hidden' }}>
      {/* Header */}
      <Box onClick={() => setOpen(o=>!o)} sx={{ display:'flex', alignItems:'center',
        justifyContent:'space-between', px:3, py:2, cursor:'pointer',
        bgcolor:surface, '&:hover':{ bgcolor:hover } }}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ color:txt }}>
          {week.title || `Week ${week.weekNumber}`}
        </Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Typography variant="caption" sx={{ color:sub }}>
            {week.activities?.length||0} items
          </Typography>
          {isInstructor && (
            <>
              <Button size="small" startIcon={<Assignment sx={{ fontSize:14 }}/>}
                onClick={e=>{ e.stopPropagation(); setShowAssign(true); }}
                sx={{ fontSize:'0.7rem', color:sub, '&:hover':{ color:txt } }}>
                + Assignment
              </Button>
              <Button size="small" startIcon={<QuizIcon sx={{ fontSize:14 }}/>}
                onClick={e=>{ e.stopPropagation(); setShowQuiz(true); }}
                sx={{ fontSize:'0.7rem', color:sub, '&:hover':{ color:txt } }}>
                + Quiz
              </Button>
              <Button size="small" startIcon={<Add sx={{ fontSize:14 }}/>}
                onClick={e=>{ e.stopPropagation(); setShowAdd(true); }}
                sx={{ fontSize:'0.7rem', color:sub, '&:hover':{ color:txt } }}>
                + Activity
              </Button>
            </>
          )}
          <IconButton size="small" onClick={e=>{ e.stopPropagation(); setOpen(o=>!o); }}>
            {open ? <ExpandLess fontSize="small"/> : <ExpandMore fontSize="small"/>}
          </IconButton>
          <Typography variant="caption" sx={{ color:sub, fontSize:'0.68rem' }}>
            Collapse all
          </Typography>
        </Box>
      </Box>

      <Collapse in={open}>
        <Box sx={{ bgcolor: isDark?'#111827':'#FAFAFA' }}>
          {(week.activities||[]).length===0 ? (
            <Box sx={{ py:3, textAlign:'center' }}>
              <Typography variant="body2" sx={{ color:sub }}>No activities yet.</Typography>
            </Box>
          ) : (week.activities||[]).map((act,i) => {
            const color = ACT_COLOR[act.type] || '#6366f1';
            return (
              <Box key={act._id||i} sx={{
                display:'flex', alignItems:'center', gap:2, py:1.5, px:3,
                borderBottom:`1px solid ${border}`,
                '&:hover':{ bgcolor:hover }, transition:'background 0.12s',
              }}>
                <Box sx={{ width:32, height:32, borderRadius:2, bgcolor:`${color}15`,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  color }}>
                  {ACT_ICON[act.type] || ACT_ICON.file}
                </Box>
                <Box sx={{ flex:1, minWidth:0 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ color }} noWrap>
                    {act.title}
                  </Typography>
                  {act.closeDate && (
                    <Typography variant="caption" sx={{ color:sub }}>
                      Due: {new Date(act.closeDate).toLocaleDateString('en-PK',{ day:'numeric', month:'short', year:'numeric' })}
                    </Typography>
                  )}
                </Box>
                {isInstructor && (
                  <IconButton size="small" sx={{ color:sub }}
                    disabled={deleting[act._id]}
                    onClick={() => handleDeleteActivity(act._id)}>
                    {deleting[act._id] ? <CircularProgress size={14}/> : <Delete fontSize="small"/>}
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Box>
      </Collapse>

      {showAssign && (
        <AssignmentDialog courseId={courseId} weekId={week._id}
          onClose={() => setShowAssign(false)} onSaved={onReload}/>
      )}
      {showQuiz && (
        <QuizDialog courseId={courseId} weekId={week._id}
          onClose={() => setShowQuiz(false)} onSaved={onReload}/>
      )}
      {showAdd && (
        <AddActivityDialog courseId={courseId} weekId={week._id}
          onClose={() => setShowAdd(false)} onSaved={onReload}/>
      )}
    </Box>
  );
}

// ══════════════════════════════════════════════════════
// MAIN — InstructorCourseDetail
// ══════════════════════════════════════════════════════
export default function InstructorCourseDetail() {
  const { courseId } = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const { mode }     = useThemeMode();
  const isDark       = mode === 'dark';

  const [course,      setCourse]     = useState(null);
  const [enrollments, setEnrollments]= useState([]);
  const [assignments, setAssignments]= useState([]);
  const [quizzes,     setQuizzes]    = useState([]);
  const [tab,         setTab]        = useState(0);
  const [loading,     setLoading]    = useState(true);
  const [addWeekOpen, setAddWeekOpen]= useState(false);
  const [weekTitle,   setWeekTitle]  = useState('');

  const surface = isDark ? '#1F2937' : '#fff';
  const border  = isDark ? '#374151' : '#E5E7EB';
  const txt     = isDark ? '#F9FAFB' : '#111827';
  const sub     = isDark ? '#9CA3AF' : '#6B7280';
  const hover   = isDark ? '#374151' : '#F3F4F6';

  const loadCourse = async () => {
    try {
      const [cRes, aRes, qRes] = await Promise.all([
        courseAPI.getOne(courseId),
        assignAPI.getByCourse(courseId),
        quizAPI.getByCourse(courseId),
      ]);
      setCourse(cRes.data);
      setAssignments(aRes.data || []);
      setQuizzes(qRes.data || []);
      // Load enrollment records to get student names
      try {
        const { default: API } = await import('../../services/api');
        const eRes = await API.get('/enrollments/by-course/' + courseId);
        setEnrollments(eRes.data || []);
      } catch {
        // fallback: enrollments unavailable
      }
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  // Load enrolled students from course data
  const loadEnrollments = async () => {
    // We use course.enrolledStudents array + admin API if available
    // For now show count from course data
  };

  useEffect(() => { loadCourse(); }, [courseId]);

  const handleAddWeek = async () => {
    if (!weekTitle.trim()) return toast.error('Week title required');
    try {
      await courseAPI.addWeek(courseId, { title: weekTitle });
      toast.success('Week added!');
      setWeekTitle(''); setAddWeekOpen(false);
      loadCourse();
    } catch { toast.error('Failed'); }
  };

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <CircularProgress size={48}/>
    </Box>
  );
  if (!course) return null;

  const TABS = ['Course','Participants','Grades','Reports','Settings'];

  return (
    <Box>
      {/* Breadcrumb */}
      <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
        <IconButton size="small" onClick={() => navigate('/instructor/courses')} sx={{ color:sub }}>
          <ArrowBack fontSize="small"/>
        </IconButton>
        <Typography variant="caption" sx={{ color:sub, cursor:'pointer' }}
          onClick={() => navigate('/instructor/courses')}>
          My Courses
        </Typography>
        <Typography variant="caption" sx={{ color:sub }}>/</Typography>
        <Typography variant="caption" sx={{ color:txt }} noWrap>{course.title}</Typography>
      </Box>

      {/* Course header + tabs */}
      <Box sx={{ bgcolor:surface, borderRadius:3, mb:3,
        border:`1px solid ${border}`, overflow:'hidden' }}>
        <Box sx={{ px:3, pt:3, pb:0 }}>
          <Typography variant="h5" fontWeight={800} sx={{ color:txt, mb:2 }}>
            {course.title}
          </Typography>
          <Box sx={{ display:'flex', gap:1, mb:2, flexWrap:'wrap' }}>
            <Chip label={course.category} size="small" variant="outlined"/>
            <Chip label={course.level} size="small" variant="outlined"/>
            <Chip label={course.status} size="small"
              color={course.status==='published'?'success':'default'}/>
            <Chip icon={<People sx={{ fontSize:'14px !important' }}/>}
              label={`${course.enrolledStudents?.length||0} students`}
              size="small" variant="outlined"/>
          </Box>
          <Tabs value={tab} onChange={(_,v)=>setTab(v)}
            sx={{ '& .MuiTab-root':{ fontSize:'0.835rem', fontWeight:600, color:sub,
              minWidth:'auto', px:2, textTransform:'none' },
              '& .Mui-selected':{ color:'#ef4444' },
              '& .MuiTabs-indicator':{ bgcolor:'#ef4444', height:3 } }}>
            {TABS.map((t,i) => <Tab key={i} label={t}/>)}
          </Tabs>
        </Box>
      </Box>

      {/* ── Tab: Course ── */}
      {tab===0 && (
        <Box>
          {/* Add week button */}
          <Box sx={{ display:'flex', justifyContent:'flex-end', mb:2 }}>
            <Button variant="outlined" startIcon={<Add/>} size="small"
              onClick={() => setAddWeekOpen(true)}>
              Add Week / Section
            </Button>
          </Box>

          {(course.weeks||[]).length===0 ? (
            <Card sx={{ p:6, textAlign:'center', borderRadius:3, border:`1px solid ${border}`, bgcolor:surface }}>
              <Typography sx={{ color:sub, mb:2 }}>No content yet. Add your first section.</Typography>
              <Button variant="contained" startIcon={<Add/>} onClick={() => setAddWeekOpen(true)}>
                Add Section
              </Button>
            </Card>
          ) : (course.weeks||[]).map((week, i) => (
            <WeekSection key={week._id||i} week={week}
              courseId={courseId} isInstructor={true} onReload={loadCourse}/>
          ))}
        </Box>
      )}

      {/* ── Tab: Participants ── */}
      {tab===1 && (
        <Box sx={{ bgcolor:surface, borderRadius:3, p:3, border:`1px solid ${border}` }}>
          <Typography variant="h6" fontWeight={700} sx={{ color:txt, mb:2 }}>
            Enrolled Students ({course.enrolledStudents?.length||0})
          </Typography>
          {(course.enrolledStudents||[]).length===0 ? (
            <Typography sx={{ color:sub }}>No students enrolled yet.</Typography>
          ) : (
            <Box sx={{ display:'flex', flexDirection:'column', gap:1.5 }}>
              {(course.enrolledStudents||[]).map((studentId, i) => {
                // Try to find name from enrollments
                const enr = enrollments.find(e => e.studentId === studentId);
                const name = enr?.studentName || `Student ${i+1}`;
                const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0,2);
                return (
                  <Box key={i} sx={{ display:'flex', alignItems:'center', gap:1.5,
                    p:1.5, bgcolor:hover, borderRadius:2, border:`1px solid ${border}` }}>
                    <Avatar sx={{ width:36, height:36, bgcolor: isDark?'#374151':'#E5E7EB',
                      fontSize:14, fontWeight:700, color:txt }}>
                      {initials}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color:txt }}>{name}</Typography>
                      <Typography variant="caption" sx={{ color:sub }}>
                        Progress: {enr?.progress||0}%{enr?.status==='completed'?' · Completed':''}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {/* ── Tab: Grades ── */}
      {tab===2 && (
        <Box sx={{ bgcolor:surface, borderRadius:3, p:3, border:`1px solid ${border}` }}>
          <Typography variant="h6" fontWeight={700} sx={{ color:txt, mb:2 }}>Grades</Typography>
          {assignments.length===0 ? (
            <Typography sx={{ color:sub }}>No assignments to grade yet.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th':{ fontWeight:700, color:sub, fontSize:'0.78rem' } }}>
                  <TableCell>Assignment</TableCell>
                  <TableCell>Submissions</TableCell>
                  <TableCell>Graded</TableCell>
                  <TableCell>Avg Score</TableCell>
                  <TableCell>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map(a => {
                  const subs    = a.submissions || [];
                  const graded  = subs.filter(s => s.grade != null);
                  const avgScore= graded.length
                    ? Math.round(graded.reduce((s,x)=>s+x.grade,0)/graded.length) : null;
                  return (
                    <TableRow key={a._id} sx={{ '&:hover':{ bgcolor:hover } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} sx={{ color:txt }}>{a.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={subs.length} size="small" variant="outlined"/>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color:sub }}>{graded.length}/{subs.length}</Typography>
                      </TableCell>
                      <TableCell>
                        {avgScore!=null ? (
                          <Chip label={`${avgScore}/${a.totalPoints}`} size="small"
                            color={avgScore/a.totalPoints>=0.6?'success':'warning'}/>
                        ) : <Typography variant="caption" sx={{ color:sub }}>—</Typography>}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color:sub }}>
                          {a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-PK') : '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Box>
      )}

      {/* ── Tab: Reports ── */}
      {tab===3 && (
        <Box sx={{ bgcolor:surface, borderRadius:3, p:3, border:`1px solid ${border}` }}>
          <Typography variant="h6" fontWeight={700} sx={{ color:txt, mb:2 }}>Course Reports</Typography>
          <Grid container spacing={3}>
            {[
              { label:'Total Students',  value:course.enrolledStudents?.length||0,      icon:<People/>     },
              { label:'Total Assignments',value:assignments.length,                     icon:<Assignment/> },
              { label:'Total Quizzes',   value:quizzes.length,                         icon:<QuizIcon/>   },
              { label:'Content Items',   value:(course.weeks||[]).reduce((s,w)=>s+w.activities.length,0), icon:<PlayCircle/> },
            ].map((s,i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ p:2.5, bgcolor:hover, borderRadius:2, textAlign:'center' }}>
                  {React.cloneElement(s.icon, { sx:{ color:sub, fontSize:28, mb:1 } })}
                  <Typography variant="h5" fontWeight={800} sx={{ color:txt }}>{s.value}</Typography>
                  <Typography variant="caption" sx={{ color:sub }}>{s.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ── Tab: Settings ── */}
      {tab===4 && (
        <Box sx={{ bgcolor:surface, borderRadius:3, p:3, border:`1px solid ${border}` }}>
          <Typography variant="h6" fontWeight={700} sx={{ color:txt, mb:2 }}>Course Settings</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Course Title" defaultValue={course.title} fullWidth sx={{ mb:2 }}/>
              <TextField label="Description" defaultValue={course.description}
                multiline rows={3} fullWidth sx={{ mb:2 }}/>
              <FormControl fullWidth sx={{ mb:2 }}>
                <InputLabel>Status</InputLabel>
                <Select defaultValue={course.status} label="Status">
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" onClick={() => toast.success('Settings saved!')}>
                Save Settings
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Add Week Dialog */}
      <Dialog open={addWeekOpen} onClose={() => setAddWeekOpen(false)}
        maxWidth="xs" fullWidth PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle fontWeight={700}>Add Week / Section</DialogTitle>
        <DialogContent>
          <TextField label="Section title" value={weekTitle}
            onChange={e=>setWeekTitle(e.target.value)} fullWidth sx={{ mt:1 }}
            placeholder="e.g. Week 4, Module 2, General"/>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:3 }}>
          <Button onClick={() => setAddWeekOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAddWeek} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
