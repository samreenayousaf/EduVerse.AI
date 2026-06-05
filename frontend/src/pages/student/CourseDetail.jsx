import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Tab, Tabs, Button, Avatar,
  CircularProgress, Collapse, IconButton, Card, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, LinearProgress, List, ListItem, Alert,
} from '@mui/material';
import {
  ExpandMore, ExpandLess, PlayCircle, PictureAsPdf,
  Assignment, Quiz as QuizIcon, Announcement, InsertDriveFile,
  ArrowBack, People, Schedule, CheckCircle, Upload,
  Download, AccessTime, CalendarToday, Timer,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { courseAPI, enrollAPI, assignAPI, quizAPI } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const ACTIVITY_ICON = {
  video:        <PlayCircle sx={{ color: '#6366f1', fontSize: 20 }} />,
  pdf:          <PictureAsPdf sx={{ color: '#ef4444', fontSize: 20 }} />,
  assignment:   <Assignment sx={{ color: '#f59e0b', fontSize: 20 }} />,
  quiz:         <QuizIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />,
  announcement: <Announcement sx={{ color: '#6366f1', fontSize: 20 }} />,
  file:         <InsertDriveFile sx={{ color: '#0891b2', fontSize: 20 }} />,
};

const ACTIVITY_COLOR = {
  video:'#6366f1', pdf:'#ef4444', assignment:'#f59e0b',
  quiz:'#8b5cf6', announcement:'#6366f1', file:'#0891b2',
};

function getDaysLeft(date) {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  const days = Math.ceil(diff / 86400000);
  if (days < 0)   return { text: 'Overdue', color: '#ef4444' };
  if (days === 0) return { text: 'Due today', color: '#f59e0b' };
  if (days <= 3)  return { text: `${days}d left`, color: '#f59e0b' };
  return { text: `${days} days left`, color: '#10b981' };
}

function AssignmentDialog({ assignment, onClose, onSubmitted }) {
  const [content,    setContent]    = useState('');
  const [file,       setFile]       = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > MAX_SIZE) { toast.error('File must be under 10MB'); return; }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !file) return toast.error('Write an answer or attach a file');
    setSubmitting(true);
    try {
      await assignAPI.submit(assignment.refId || assignment._id, {
        content: content || (file ? `File: ${file.name}` : ''),
        fileUrl:  file ? URL.createObjectURL(file) : '',
        fileName: file?.name || '',
      });
      toast.success('Assignment submitted! ✅');
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed');
    } finally { setSubmitting(false); }
  };

  const due = getDaysLeft(assignment.closeDate);
  const isOpen = !assignment.openDate || new Date() >= new Date(assignment.openDate);

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3 } }}>
      <DialogTitle>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Assignment sx={{ color:'#f59e0b' }} />
          <Box>
            <Typography fontWeight={800}>{assignment.title}</Typography>
            <Typography variant="caption" color="text.secondary">{assignment.courseName}</Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Dates */}
        <Box sx={{ display:'flex', gap:3, mb:2, p:2, bgcolor:'#f8f9ff', borderRadius:2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Opens</Typography>
            <Typography variant="body2" fontWeight={600}>
              {assignment.openDate
                ? new Date(assignment.openDate).toLocaleDateString('en-PK',{ weekday:'short', day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })
                : 'Immediately'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Due</Typography>
            <Typography variant="body2" fontWeight={600}
              sx={{ color: due?.color || 'text.primary' }}>
              {assignment.closeDate
                ? new Date(assignment.closeDate).toLocaleDateString('en-PK',{ weekday:'short', day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })
                : 'No deadline'}
            </Typography>
          </Box>
        </Box>

        {/* Description */}
        {assignment.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb:2, lineHeight:1.8 }}>
            {assignment.description}
          </Typography>
        )}

        {/* Instructor file attachment */}
        {assignment.fileUrl && (
          <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2, p:1.5,
            border:'1px solid #e0e0e0', borderRadius:2 }}>
            <PictureAsPdf sx={{ color:'#ef4444' }} />
            <Box sx={{ flex:1 }}>
              <Typography variant="body2" fontWeight={600}>{assignment.fileName || 'Assignment file'}</Typography>
              <Typography variant="caption" color="text.secondary">{assignment.fileSize}</Typography>
            </Box>
            <Button size="small" startIcon={<Download />}
              href={assignment.fileUrl} target="_blank" variant="outlined"
              sx={{ fontSize:'0.75rem' }}>
              Download
            </Button>
          </Box>
        )}

        {/* Submission status */}
        <Box sx={{ mb:2, border:'1px solid #e0e0e0', borderRadius:2, overflow:'hidden' }}>
          <Box sx={{ bgcolor:'#f9fafb', px:2, py:1, borderBottom:'1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" fontWeight={700}>Submission status</Typography>
          </Box>
          {[
            { label:'Submission status', value: assignment.mySubmission ? 'Submitted' : 'No submission yet' },
            { label:'Grading status',    value: assignment.mySubmission?.grade != null ? `Graded: ${assignment.mySubmission.grade}` : 'Not graded' },
            { label:'Time remaining',    value: due ? due.text : 'No deadline' },
          ].map((row, i) => (
            <Box key={i} sx={{ display:'flex', px:2, py:1.2, borderBottom: i < 2 ? '1px solid #e0e0e0' : 'none' }}>
              <Typography variant="body2" color="text.secondary" sx={{ width:160 }}>{row.label}</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: i === 2 ? due?.color : 'text.primary' }}>
                {row.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Submit area */}
        {!assignment.mySubmission && isOpen && (
          <>
            <TextField label="Your answer / solution" multiline rows={4} fullWidth
              value={content} onChange={e => setContent(e.target.value)}
              placeholder="Write your answer, paste a Google Docs link, GitHub repo link, etc..."
              sx={{ mb:2 }}
            />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb:1 }}>
                Or attach a file (PDF, Word, max 10MB)
              </Typography>
              <Button component="label" variant="outlined" startIcon={<Upload />}
                sx={{ borderStyle:'dashed', width:'100%', py:1.5 }}>
                {file ? `${file.name} (${(file.size/1024).toFixed(0)} KB)` : 'Choose file (PDF, DOCX, PPTX, max 10MB)'}
                <input type="file" hidden accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt"
                  onChange={handleFileChange} />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt:0.5, display:'block' }}>
                Accepted: PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx), ZIP, TXT
              </Typography>
            </Box>
          </>
        )}
        {assignment.mySubmission && (
          <Alert severity="success" sx={{ borderRadius:2 }}>
            Already submitted{assignment.mySubmission.grade != null
              ? ` — Grade: ${assignment.mySubmission.grade}/${assignment.totalPoints}` : ' — Awaiting grade'}
            {assignment.mySubmission.feedback && <Typography variant="body2" sx={{ mt:0.5 }}>
              Feedback: {assignment.mySubmission.feedback}
            </Typography>}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px:3, pb:3 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
        {!assignment.mySubmission && isOpen && (
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}
            sx={{ bgcolor:'#f59e0b', '&:hover':{ bgcolor:'#d97706' } }}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : 'Submit Assignment'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function QuizDialog({ quiz, onClose }) {
  const navigate = useNavigate();
  const myAttempts = quiz.attempts || [];
  const bestScore  = myAttempts.length ? Math.max(...myAttempts.map(a => a.percentage)) : null;
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx:{ borderRadius:3 } }}>
      <DialogTitle>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <QuizIcon sx={{ color:'#8b5cf6' }} />
          <Typography fontWeight={800}>{quiz.title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
          {[
            { label:'Questions',      value:`${quiz.questions?.length || 0} questions` },
            { label:'Time Limit',     value:`${quiz.timeLimit || 30} minutes`           },
            { label:'Passing Score',  value:`${quiz.passingScore || 60}%`               },
            { label:'Attempts',       value: myAttempts.length > 0 ? `${myAttempts.length} attempt(s)` : 'Not attempted' },
          ].map((r,i) => (
            <Box key={i} sx={{ display:'flex', justifyContent:'space-between',
              py:1, borderBottom:'1px solid #f0f0f0' }}>
              <Typography variant="body2" color="text.secondary">{r.label}</Typography>
              <Typography variant="body2" fontWeight={600}>{r.value}</Typography>
            </Box>
          ))}
          {bestScore !== null && (
            <Box>
              <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                <Typography variant="caption" color="text.secondary">Best Score</Typography>
                <Typography variant="caption" fontWeight={700}>{bestScore}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={bestScore}
                sx={{ height:8, borderRadius:4,
                  '& .MuiLinearProgress-bar':{ bgcolor: bestScore >= (quiz.passingScore||60) ? '#10b981' : '#f59e0b' } }} />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px:3, pb:3 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={() => { onClose(); navigate('/student/quizzes'); }}
          sx={{ bgcolor:'#8b5cf6', '&:hover':{ bgcolor:'#7c3aed' } }}>
          Attempt Quiz
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ActivityRow({ activity, assignments, quizzes, completedIds, onMarkDone, onActivityClick }) {
  const { mode } = useThemeMode();
  const isDark   = mode === 'dark';
  const color    = ACTIVITY_COLOR[activity.type] || '#6366f1';
  const icon     = ACTIVITY_ICON[activity.type];
  const actId    = activity._id?.toString();
  const done     = completedIds.has(actId);

  // Find linked assignment/quiz data
  let extra = null;
  if (activity.type === 'assignment') {
    extra = assignments.find(a => a._id === activity.refId || a.title === activity.title);
  }
  if (activity.type === 'quiz') {
    extra = quizzes.find(q => q._id === activity.refId || q.title === activity.title);
  }

  const due = activity.closeDate ? getDaysLeft(activity.closeDate) : null;

  return (
    <Box
      onClick={() => onActivityClick(activity, extra)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 2, py: 1.5, px: 2,
        borderBottom: `1px solid ${isDark ? '#374151' : '#F3F4F6'}`,
        cursor: 'pointer',
        '&:hover': { bgcolor: isDark ? '#374151' : '#F9FAFB' },
        transition: 'background 0.15s',
      }}
    >
      <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600}
          sx={{ color: color, '&:hover':{ textDecoration:'underline' } }} noWrap>
          {activity.title}
        </Typography>
        {activity.duration && (
          <Typography variant="caption" sx={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            {activity.duration}
          </Typography>
        )}
        {activity.openDate && (
          <Typography variant="caption" sx={{ color: isDark ? '#9CA3AF' : '#6B7280', display:'block' }}>
            Opens: {new Date(activity.openDate).toLocaleDateString('en-PK',{ day:'numeric', month:'short', year:'numeric' })}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        {due && (
          <Chip label={due.text} size="small"
            sx={{ bgcolor: `${due.color}15`, color: due.color, fontWeight: 700, fontSize: '0.68rem' }} />
        )}
        {(activity.type === 'assignment' || activity.type === 'quiz') && (
          <Box onClick={e => { e.stopPropagation(); onActivityClick(activity, extra); }}
            sx={{ px:1.5, py:0.5, borderRadius:2, border:'1px solid',
              borderColor: activity.type==='assignment'?'#f59e0b':'#8b5cf6',
              color: activity.type==='assignment'?'#f59e0b':'#8b5cf6',
              fontSize:'0.72rem', fontWeight:700, cursor:'pointer',
              '&:hover':{ bgcolor: activity.type==='assignment'?'#fff7ed':'#f5f3ff' } }}>
            Attempt
          </Box>
        )}
        {done && <CheckCircle sx={{ color: '#10b981', fontSize: 18 }} />}
      </Box>
    </Box>
  );
}

function WeekSection({ week, assignments, quizzes, completedIds, onMarkDone, onActivityClick }) {
  const { mode } = useThemeMode();
  const isDark   = mode === 'dark';
  const [open, setOpen] = useState(true);
  const isGeneral = week.weekNumber === 0;
  const border = isDark ? '#374151' : '#E5E7EB';
  const surface = isDark ? '#1F2937' : '#fff';
  const txt  = isDark ? '#F9FAFB' : '#111827';

  return (
    <Box sx={{ border: `1px solid ${border}`, borderRadius: 3, mb: 2, overflow: 'hidden' }}>
      {/* Week header */}
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 3, py: 2, cursor: 'pointer', bgcolor: surface,
          '&:hover': { bgcolor: isDark ? '#374151' : '#F9FAFB' },
        }}
      >
        <Typography variant="subtitle1" fontWeight={800} sx={{ color: txt }}>
          {week.title || (isGeneral ? 'General' : `Week ${week.weekNumber}`)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            {week.activities?.length || 0} items
          </Typography>
          <IconButton size="small">
            {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </IconButton>
          <Typography variant="caption" sx={{ color: isDark ? '#6B7280' : '#9CA3AF', fontSize:'0.7rem' }}>
            Collapse all
          </Typography>
        </Box>
      </Box>

      <Collapse in={open}>
        {week.activities?.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center', bgcolor: isDark ? '#111827' : '#F9FAFB' }}>
            <Typography variant="body2" sx={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>
              No activities in this section yet.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ bgcolor: isDark ? '#111827' : '#FAFAFA' }}>
            {week.activities?.map((act, i) => (
              <ActivityRow key={act._id || i}
                activity={act}
                assignments={assignments}
                quizzes={quizzes}
                completedIds={completedIds}
                onMarkDone={onMarkDone}
                onActivityClick={onActivityClick}
              />
            ))}
          </Box>
        )}
      </Collapse>
    </Box>
  );
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate     = useNavigate();
  const { mode }     = useThemeMode();
  const isDark       = mode === 'dark';

  const [course,      setCourse]     = useState(null);
  const [enrollment,  setEnrollment] = useState(null);
  const [assignments, setAssignments]= useState([]);
  const [quizzes,     setQuizzes]    = useState([]);
  const [tab,         setTab]        = useState(0);
  const [loading,     setLoading]    = useState(true);
  const [selectedAct, setSelectedAct]= useState(null);
  const [actDialog,   setActDialog]  = useState(null); // 'assignment' | 'quiz'

  const bg      = isDark ? '#111827' : '#F9FAFB';
  const surface = isDark ? '#1F2937' : '#fff';
  const border  = isDark ? '#374151' : '#E5E7EB';
  const txt     = isDark ? '#F9FAFB' : '#111827';
  const sub     = isDark ? '#9CA3AF' : '#6B7280';

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, eRes] = await Promise.all([
          courseAPI.getOne(courseId),
          enrollAPI.getMyEnroll(),
        ]);
        setCourse(cRes.data);
        const enr = eRes.data.find(e => (e.courseId?._id || e.courseId) === courseId);
        setEnrollment(enr);
        // Load assignments + quizzes
        const [aRes, qRes] = await Promise.all([
          assignAPI.getByCourse(courseId),
          quizAPI.getByCourse(courseId),
        ]);
        setAssignments(aRes.data || []);
        setQuizzes(qRes.data || []);
      } catch (err) { toast.error('Failed to load course'); }
      finally { setLoading(false); }
    };
    load();
  }, [courseId]);

  const completedIds = new Set(enrollment?.completedLectures || []);
  const progress = enrollment?.progress || 0;

  const handleActivityClick = (activity, extra) => {
    if (activity.type === 'assignment') {
      const aData = extra || assignments.find(a => a.title === activity.title) || {};
      setSelectedAct({ ...aData, ...activity, title: activity.title });
      setActDialog('assignment');
    } else if (activity.type === 'quiz') {
      const qData = extra || quizzes.find(q => q.title === activity.title) || {};
      setSelectedAct({ ...qData, ...activity, title: activity.title });
      setActDialog('quiz');
    } else if (activity.type === 'video' && activity.content) {
      window.open(activity.content, '_blank');
    } else if ((activity.type === 'pdf' || activity.type === 'file') && activity.fileUrl) {
      window.open(activity.fileUrl, '_blank');
    } else if (activity.type === 'announcement') {
      toast.info(activity.content || activity.title);
    }
  };

  const handleSubmitted = async () => {
    const [aRes] = await Promise.all([assignAPI.getByCourse(courseId)]);
    setAssignments(aRes.data || []);
  };

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <CircularProgress size={48} />
    </Box>
  );
  if (!course) return null;

  const TABS_LIST = ['Course','Participants','Grades','Competencies'];

  return (
    <Box sx={{ bgcolor: bg, minHeight: '100vh' }}>
      {/* Back */}
      <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
        <IconButton onClick={() => navigate('/student/courses')} size="small" sx={{ color: sub }}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ color: sub, cursor:'pointer' }}
          onClick={() => navigate('/student/courses')}>
          My Courses
        </Typography>
        <Typography variant="body2" sx={{ color: sub }}>/</Typography>
        <Typography variant="body2" sx={{ color: txt }} noWrap>{course.title}</Typography>
      </Box>

      {/* Course title + tabs */}
      <Box sx={{ bgcolor: surface, borderRadius: 3, mb: 3, overflow:'hidden',
        border: `1px solid ${border}` }}>
        <Box sx={{ px: 3, pt: 3, pb: 0 }}>
          <Typography variant="h5" fontWeight={800} sx={{ color: txt, mb: 0.5 }}>
            {course.title}
          </Typography>

          {/* Progress bar */}
          {enrollment && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                <Typography variant="caption" sx={{ color: sub }}>Your progress</Typography>
                <Typography variant="caption" fontWeight={700} sx={{ color: txt }}>{progress}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress}
                sx={{ height: 6, borderRadius: 3,
                  '& .MuiLinearProgress-bar':{ bgcolor:'#6366f1' } }} />
            </Box>
          )}

          {/* Tab bar */}
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{
              '& .MuiTab-root': { fontSize:'0.835rem', fontWeight:600, color:sub, minWidth:'auto', px:2 },
              '& .Mui-selected': { color:'#ef4444' },
              '& .MuiTabs-indicator': { bgcolor:'#ef4444', height:3 },
            }}>
            {TABS_LIST.map((t,i) => <Tab key={i} label={t} />)}
          </Tabs>
        </Box>
      </Box>

      {/* Tab content */}
      {tab === 0 && (
        <Box>
          {/* Sort/collapse header */}
          <Box sx={{ display:'flex', justifyContent:'flex-end', mb:1 }}>
            <Typography variant="caption" sx={{ color: sub }}>
              {(course.weeks||[]).reduce((s,w) => s + w.activities.length, 0)} total activities
            </Typography>
          </Box>

          {/* Weeks */}
          {(course.weeks || []).map((week, i) => (
            <WeekSection key={week._id || i}
              week={week}
              assignments={assignments}
              quizzes={quizzes}
              completedIds={completedIds}
              onMarkDone={() => {}}
              onActivityClick={handleActivityClick}
            />
          ))}

          {(!course.weeks || course.weeks.length === 0) && (
            <Box sx={{ textAlign:'center', py:8, bgcolor:surface, borderRadius:3,
              border:`1px solid ${border}` }}>
              <Typography sx={{ color:sub }}>No content available yet.</Typography>
            </Box>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ bgcolor:surface, borderRadius:3, p:3, border:`1px solid ${border}` }}>
          <Typography variant="h6" fontWeight={700} sx={{ color:txt, mb:2 }}>Participants</Typography>
          <Box sx={{ display:'flex', alignItems:'center', gap:1.5, p:2,
            bgcolor: isDark?'#111827':'#f9fafb', borderRadius:2 }}>
            <Avatar sx={{ bgcolor:'#6366f1', width:36, height:36, fontSize:14, fontWeight:700 }}>
              {course.instructorName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700} sx={{ color:txt }}>
                {course.instructorName}
              </Typography>
              <Typography variant="caption" sx={{ color:sub }}>Instructor</Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color:sub, mt:2 }}>
            {course.enrolledStudents?.length || 0} student{(course.enrolledStudents?.length||0)!==1?'s':''} enrolled
          </Typography>
        </Box>
      )}

      {tab === 2 && (
        <Box sx={{ bgcolor:surface, borderRadius:3, p:3, border:`1px solid ${border}` }}>
          <Typography variant="h6" fontWeight={700} sx={{ color:txt, mb:2 }}>Grades</Typography>
          {assignments.filter(a => a.mySubmission?.grade != null).length === 0 ? (
            <Typography sx={{ color:sub }}>No grades yet.</Typography>
          ) : assignments.filter(a => a.mySubmission?.grade != null).map(a => (
            <Box key={a._id} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              py:1.5, borderBottom:`1px solid ${border}` }}>
              <Typography variant="body2" sx={{ color:txt }}>{a.title}</Typography>
              <Chip label={`${a.mySubmission.grade}/${a.totalPoints}`} size="small"
                color="success" sx={{ fontWeight:700 }} />
            </Box>
          ))}
        </Box>
      )}

      {tab === 3 && (
        <Box sx={{ bgcolor:surface, borderRadius:3, p:3, border:`1px solid ${border}` }}>
          <Typography variant="h6" fontWeight={700} sx={{ color:txt, mb:1 }}>Competencies</Typography>
          <Typography sx={{ color:sub }}>Course competencies will appear here.</Typography>
        </Box>
      )}

      {/* Assignment Dialog */}
      {actDialog === 'assignment' && selectedAct && (
        <AssignmentDialog
          assignment={selectedAct}
          onClose={() => { setActDialog(null); setSelectedAct(null); }}
          onSubmitted={handleSubmitted}
        />
      )}

      {/* Quiz Dialog */}
      {actDialog === 'quiz' && selectedAct && (
        <QuizDialog
          quiz={selectedAct}
          onClose={() => { setActDialog(null); setSelectedAct(null); }}
        />
      )}
    </Box>
  );
}
