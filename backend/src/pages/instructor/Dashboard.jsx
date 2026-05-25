import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Button, Chip, Avatar,
  CircularProgress, IconButton, Divider, LinearProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, List, Tab, Tabs,
} from '@mui/material';
import {
  Add, People, School, Assignment, CheckCircle, ChevronLeft,
  ChevronRight, CalendarMonth, Schedule, Quiz as QuizIcon,
  Announcement, BarChart as BarChartIcon, TrendingUp, Grade,
  Upload, Visibility,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, AreaChart, Area,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import StatCard from '../../components/common/StatCard';
import { courseAPI, analyticsAPI, assignAPI, quizAPI } from '../../services/api';
import { toast } from 'react-toastify';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function InstructorDashboard() {
  const { user }  = useAuth();
  const { mode }  = useThemeMode();
  const navigate  = useNavigate();
  const today     = new Date();
  const isDark    = mode === 'dark';

  const surface = isDark ? '#1F2937' : '#FFFFFF';
  const border  = isDark ? '#374151' : '#E5E7EB';
  const txt     = isDark ? '#F9FAFB' : '#111827';
  const sub     = isDark ? '#9CA3AF' : '#6B7280';
  const hover   = isDark ? '#374151' : '#F3F4F6';

  const [courses,      setCourses]      = useState([]);
  const [stats,        setStats]        = useState(null);
  const [events,       setEvents]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [calYear,      setCalYear]      = useState(today.getFullYear());
  const [calMonth,     setCalMonth]     = useState(today.getMonth());
  const [selectedDay,  setSelectedDay]  = useState(null);
  const [activeTab,    setActiveTab]    = useState(0);
  const [annDialog,    setAnnDialog]    = useState(false);
  const [annText,      setAnnText]      = useState('');
  const [announcements, setAnnouncements] = useState([
    { id: 1, text: 'Assignment deadline extended to Friday.', date: new Date(Date.now() - 86400000 * 2) },
    { id: 2, text: 'New lecture on React Context API uploaded.', date: new Date(Date.now() - 86400000) },
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, aRes] = await Promise.all([courseAPI.getMyCourses(), analyticsAPI.instructor()]);
        setCourses(cRes.data);
        setStats(aRes.data);
        const allEvents = [];
        for (const course of cRes.data) {
          const cId = course._id || course.id;
          if (!cId) continue;
          try {
            const [asnRes, qzRes] = await Promise.all([assignAPI.getByCourse(cId), quizAPI.getByCourse(cId)]);
            (asnRes.data || []).forEach(a => {
              if (a.dueDate) allEvents.push({ id: a._id, type: 'assignment', title: a.title, courseName: course.title, date: new Date(a.dueDate) });
            });
            (qzRes.data || []).forEach(q => {
              allEvents.push({ id: q._id, type: 'quiz', title: q.title, courseName: course.title, date: new Date(q.dueDate || q.createdAt) });
            });
          } catch {}
        }
        setEvents(allEvents);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const calDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    let offset = firstDay.getDay() - 1; if (offset < 0) offset = 6;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrev = new Date(calYear, calMonth, 0).getDate();
    const cells = [];
    for (let i = offset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, current: false, date: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true, date: new Date(calYear, calMonth, d) });
    while ((cells.length % 7) !== 0) cells.push({ day: cells.length - daysInMonth - offset + 1, current: false, date: null });
    return cells;
  }, [calYear, calMonth]);

  const eventsOnDate = (date) => !date ? [] : events.filter(e =>
    e.date.getFullYear() === date.getFullYear() && e.date.getMonth() === date.getMonth() && e.date.getDate() === date.getDate()
  );
  const isToday = (date) => date && date.toDateString() === today.toDateString();
  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); setSelectedDay(null); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); setSelectedDay(null); };

  const upcoming = useMemo(() => {
    const now = new Date(); const limit = new Date(now.getTime() + 14 * 86400000);
    return events.filter(e => e.date >= now && e.date <= limit).sort((a, b) => a.date - b.date);
  }, [events]);

  const chartData = courses.map(c => ({ name: c.title?.substring(0, 14) + (c.title?.length > 14 ? '…' : ''), students: c.enrolledStudents?.length || 0 }));

  const engagementData = [
    { day: 'Mon', views: 45 }, { day: 'Tue', views: 62 }, { day: 'Wed', views: 38 },
    { day: 'Thu', views: 80 }, { day: 'Fri', views: 55 }, { day: 'Sat', views: 30 }, { day: 'Sun', views: 20 },
  ];

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress size={32} sx={{ color: txt }} />
    </Box>
  );

  const tabStyle = { minHeight: 36, py: 0.5, fontSize: '0.78rem', fontWeight: 600, color: sub, textTransform: 'none', '&.Mui-selected': { color: txt } };

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: txt }}>Hi, {user?.name?.split(' ')[0]} 👋</Typography>
         
        </Box>
     
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: 'My Courses',     value: String(courses.length),                                   icon: <School fontSize="small" />,    trend: 10 },
          { title: 'Total Students', value: String(stats?.totalStudents || 0),                        icon: <People fontSize="small" />,    trend: 18 },
          { title: 'Published',      value: String(courses.filter(c => c.status === 'published').length), icon: <CheckCircle fontSize="small" />, trend: 5 },
          { title: 'Upcoming Due',   value: String(upcoming.length),                                  icon: <Schedule fontSize="small" />,  trend: -3 },
        ].map((s, i) => (
          <Grid item xs={6} md={3} key={i}><StatCard {...s} /></Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${border}`, minHeight: 36 }}
        TabIndicatorProps={{ sx: { bgcolor: txt, height: 2 } }}>
        {['Overview', 'Calendar', 'Students', 'Announcements'].map(t => (
          <Tab key={t} label={t} sx={tabStyle} />
        ))}
      </Tabs>

      {/* ── TAB 0 OVERVIEW ── */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {chartData.length > 0 && (
            <Grid item xs={12} md={7}>
              <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt, mb: 2 }}>Students per Course</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={border} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: sub }} />
                      <YAxis tick={{ fontSize: 11, fill: sub }} allowDecimals={false} />
                      <RTooltip contentStyle={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 8, color: txt }} />
                      <Bar dataKey="students" fill={isDark ? '#6B7280' : '#374151'} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12} md={5}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt, mb: 2 }}>Weekly Engagement</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={engagementData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={border} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: sub }} />
                    <YAxis tick={{ fontSize: 11, fill: sub }} />
                    <RTooltip contentStyle={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 8, color: txt }} />
                    <Area type="monotone" dataKey="views" stroke={isDark ? '#6B7280' : '#374151'} fill={isDark ? '#37415140' : '#F3F4F6'} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt }}>My Courses</Typography>
                  <Button size="small" onClick={() => navigate('/instructor/courses')} sx={{ color: sub, fontSize: '0.8rem' }}>Manage All</Button>
                </Box>
                {courses.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <School sx={{ fontSize: 36, color: border, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: sub, mb: 2 }}>No courses yet</Typography>
                    <Button variant="outlined" size="small" onClick={() => navigate('/instructor/courses')}
                      sx={{ borderColor: border, color: sub, borderRadius: 2, '&:hover': { bgcolor: hover } }}>Create First Course</Button>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {courses.map((c, i) => (
                      <Grid item xs={12} sm={6} md={4} key={c._id || i}>
                        <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${border}`, bgcolor: hover }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ color: txt, flex: 1 }} noWrap>{c.title}</Typography>
                            <Chip label={c.status} size="small"
                              sx={{ ml: 1, bgcolor: c.status === 'published' ? (isDark ? '#14532d30' : '#F0FDF4') : hover, color: c.status === 'published' ? '#16A34A' : sub, fontSize: '0.6rem', height: 18, flexShrink: 0 }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: sub, display: 'block', mb: 1.5 }}>{c.enrolledStudents?.length || 0} students · {c.category}</Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="outlined" onClick={() => navigate('/instructor/courses')}
                              sx={{ fontSize: '0.7rem', borderColor: border, color: sub, py: 0.3, borderRadius: 1.5, flex: 1, '&:hover': { bgcolor: surface, borderColor: txt, color: txt } }}>
                              Edit
                            </Button>
                            <Button size="small" variant="outlined" onClick={() => navigate('/instructor/assignments')}
                              sx={{ fontSize: '0.7rem', borderColor: border, color: sub, py: 0.3, borderRadius: 1.5, flex: 1, '&:hover': { bgcolor: surface, borderColor: txt, color: txt } }}>
                              Assignments
                            </Button>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt, mb: 2 }}>Quick Actions</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'My Courses', icon: <School fontSize="small" />, path: '/instructor/courses' },
                    { label: 'Add Assignment', icon: <Assignment fontSize="small" />, path: '/instructor/assignments' },
                    { label: 'Grade Submissions', icon: <Grade fontSize="small" />, path: '/instructor/assignments' },
                    { label: 'View Analytics', icon: <BarChartIcon fontSize="small" />, path: '/instructor/analytics' },
                    { label: 'Send Announcement', icon: <Announcement fontSize="small" />, action: () => { setActiveTab(3); setAnnDialog(true); } },
                    { label: 'New Quiz', icon: <QuizIcon fontSize="small" />, path: '/instructor/quizzes' },
                  ].map((a, i) => (
                    <Grid item xs={6} sm={4} md={2} key={i}>
                      <Box onClick={a.action || (() => navigate(a.path))}
                        sx={{ p: 2, borderRadius: 2, border: `1px solid ${border}`, bgcolor: hover, cursor: 'pointer', textAlign: 'center',
                          '&:hover': { bgcolor: surface, borderColor: txt }, transition: 'all 0.15s' }}>
                        <Box sx={{ color: sub, mb: 0.5 }}>{a.icon}</Box>
                        <Typography variant="caption" fontWeight={600} sx={{ color: sub, fontSize: '0.72rem' }}>{a.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── TAB 1 CALENDAR ── */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <IconButton size="small" onClick={prevMonth} sx={{ color: sub }}><ChevronLeft fontSize="small" /></IconButton>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt }}>{MONTHS[calMonth]} {calYear}</Typography>
                  <IconButton size="small" onClick={nextMonth} sx={{ color: sub }}><ChevronRight fontSize="small" /></IconButton>
                </Box>
                <Grid container columns={7} sx={{ mb: 0.5 }}>
                  {DAYS.map(d => <Grid item xs={1} key={d}><Typography sx={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: sub, pb: 0.5 }}>{d}</Typography></Grid>)}
                </Grid>
                <Grid container columns={7}>
                  {calDays.map((cell, idx) => {
                    const dayEv = cell.date ? eventsOnDate(cell.date) : [];
                    const isSel = selectedDay && cell.date && selectedDay.toDateString() === cell.date.toDateString();
                    return (
                      <Grid item xs={1} key={idx}>
                        <Box onClick={() => cell.current && cell.date && setSelectedDay(isSel ? null : cell.date)}
                          sx={{ minHeight: 56, p: 0.3, cursor: cell.current ? 'pointer' : 'default', borderRadius: 1.5, bgcolor: isSel ? hover : 'transparent', border: `1px solid ${isSel ? border : 'transparent'}`, '&:hover': cell.current ? { bgcolor: hover } : {}, transition: 'all 0.12s' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.2 }}>
                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isToday(cell.date) ? (isDark ? '#374151' : '#1F2937') : 'transparent' }}>
                              <Typography sx={{ fontSize: '0.7rem', fontWeight: isToday(cell.date) ? 700 : 400, color: !cell.current ? (isDark ? '#4B5563' : '#D1D5DB') : isToday(cell.date) ? '#fff' : txt }}>
                                {cell.day}
                              </Typography>
                            </Box>
                          </Box>
                          {dayEv.slice(0, 2).map((ev, i) => (
                            <Box key={i} sx={{ bgcolor: isDark ? '#374151' : '#E5E7EB', borderRadius: 0.5, px: 0.3, mb: 0.2 }}>
                              <Typography sx={{ fontSize: '0.5rem', color: sub, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ev.type === 'assignment' ? '📝' : '🧠'} {ev.title}
                              </Typography>
                            </Box>
                          ))}
                          {dayEv.length > 2 && <Typography sx={{ fontSize: '0.5rem', color: sub, pl: 0.3 }}>+{dayEv.length - 2}</Typography>}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
                {selectedDay && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${border}` }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: sub, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {selectedDay.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Typography>
                    {eventsOnDate(selectedDay).length === 0
                      ? <Typography variant="body2" sx={{ color: sub, mt: 1 }}>No activities</Typography>
                      : eventsOnDate(selectedDay).map((ev, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1.5, mt: 1.5, p: 1.5, bgcolor: hover, borderRadius: 2 }}>
                          <Box sx={{ width: 6, borderRadius: 1, bgcolor: isDark ? '#6B7280' : '#374151', flexShrink: 0 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: txt }}>{ev.title}</Typography>
                            <Typography variant="caption" sx={{ color: sub }}>{ev.courseName}</Typography>
                          </Box>
                          <Chip label={ev.type} size="small" sx={{ ml: 'auto', bgcolor: hover, color: sub, fontSize: '0.6rem', height: 18, textTransform: 'capitalize' }} />
                        </Box>
                      ))
                    }
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt, mb: 2 }}>Upcoming (14 days)</Typography>
                {upcoming.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}><CalendarMonth sx={{ fontSize: 32, color: border }} /><Typography variant="body2" sx={{ color: sub, mt: 1 }}>No upcoming events</Typography></Box>
                ) : upcoming.map((ev, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, p: 1.5, bgcolor: hover, borderRadius: 2, border: `1px solid ${border}` }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: surface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {ev.type === 'assignment' ? <Assignment sx={{ fontSize: 13, color: sub }} /> : <QuizIcon sx={{ fontSize: 13, color: sub }} />}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" fontWeight={600} noWrap sx={{ color: txt, display: 'block' }}>{ev.title}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: sub }}>{ev.courseName}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: sub, fontWeight: 600 }}>{ev.date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── TAB 2 STUDENTS ── */}
      {activeTab === 2 && (
        <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt, mb: 2.5 }}>Enrolled Students by Course</Typography>
            {courses.length === 0 ? (
              <Typography variant="body2" sx={{ color: sub }}>No courses yet</Typography>
            ) : courses.map(c => (
              <Box key={c._id || c.id} sx={{ mb: 3, p: 2.5, bgcolor: hover, borderRadius: 2, border: `1px solid ${border}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: txt }}>{c.title}</Typography>
                  <Chip label={`${c.enrolledStudents?.length || 0} students`} size="small" sx={{ bgcolor: surface, color: sub, fontSize: '0.65rem', height: 20 }} />
                </Box>
                <LinearProgress variant="determinate" value={Math.min(((c.enrolledStudents?.length || 0) / 50) * 100, 100)}
                  sx={{ height: 4, borderRadius: 2, bgcolor: border, '& .MuiLinearProgress-bar': { bgcolor: isDark ? '#9CA3AF' : '#374151', borderRadius: 2 } }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                  {(c.enrolledStudents || []).slice(0, 6).map((s, i) => (
                    <Chip key={i} avatar={<Avatar sx={{ bgcolor: isDark ? '#374151' : '#E5E7EB', width: 20, height: 20, fontSize: 10, color: sub }}>{(s.name || 'S')[0].toUpperCase()}</Avatar>}
                      label={s.name || s.email || `Student ${i + 1}`} size="small"
                      sx={{ bgcolor: surface, color: sub, fontSize: '0.7rem', height: 24, border: `1px solid ${border}` }} />
                  ))}
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── TAB 3 ANNOUNCEMENTS ── */}
      {activeTab === 3 && (
        <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt }}>Announcements</Typography>
              <Button variant="contained" size="small" startIcon={<Add fontSize="small" />}
                onClick={() => setAnnDialog(true)}
                sx={{ bgcolor: isDark ? '#374151' : '#1F2937', color: '#fff', borderRadius: 2, fontSize: '0.8rem', '&:hover': { bgcolor: isDark ? '#4B5563' : '#111827' } }}>
                New Announcement
              </Button>
            </Box>
            {announcements.map(a => (
              <Box key={a.id} sx={{ p: 2, mb: 2, bgcolor: hover, borderRadius: 2, border: `1px solid ${border}` }}>
                <Typography variant="body2" sx={{ color: txt, mb: 0.5 }}>{a.text}</Typography>
                <Typography variant="caption" sx={{ color: sub }}>{a.date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={annDialog} onClose={() => setAnnDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: surface, border: `1px solid ${border}`, borderRadius: 3 } }}>
        <DialogTitle sx={{ color: txt, fontWeight: 700 }}>New Announcement</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={4} placeholder="Write your announcement..." value={annText} onChange={e => setAnnText(e.target.value)}
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { bgcolor: hover, '& fieldset': { borderColor: border }, borderRadius: 2 }, '& textarea': { color: txt } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAnnDialog(false)} sx={{ color: sub, borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            if (!annText.trim()) return;
            setAnnouncements([{ id: Date.now(), text: annText, date: new Date() }, ...announcements]);
            toast.success('Announcement sent!'); setAnnText(''); setAnnDialog(false);
          }} sx={{ bgcolor: isDark ? '#374151' : '#1F2937', color: '#fff', borderRadius: 2, '&:hover': { bgcolor: isDark ? '#4B5563' : '#111827' } }}>Send</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}