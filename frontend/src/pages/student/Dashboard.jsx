import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Grid, Typography, Card, CardContent, CircularProgress,
  IconButton, TextField, InputAdornment,
  MenuItem, Select, Button, Chip,
} from '@mui/material';
import {
  Assignment, Quiz, CheckCircle, Schedule,
  ChevronLeft, ChevronRight, CalendarMonth, Search,
  MenuBook, Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { enrollAPI, analyticsAPI, assignAPI, quizAPI, timelineAPI } from '../../services/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function UolStat({ icon, value, label }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const sub = isDark ? '#9CA3AF' : '#6B7280';
  const txt = isDark ? '#F9FAFB' : '#111827';
  return (
    <Box sx={{ display:'flex', alignItems:'center', gap:2.5 }}>
      <Box sx={{ color: sub }}>{React.cloneElement(icon, { sx:{ fontSize:32 } })}</Box>
      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ color:txt, lineHeight:1 }}>{value}</Typography>
        <Typography variant="body2" sx={{ color:sub, mt:0.3 }}>{label}</Typography>
      </Box>

    </Box>
  );
}

// Calculate how late a submission is
function lateLabel(dueDate, submittedAt) {
  if (!submittedAt || !dueDate) return null;
  const diff = new Date(submittedAt) - new Date(dueDate);
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `Submitted ${days} day${days > 1 ? 's' : ''} late`;
  return `Submitted ${hours} hour${hours > 1 ? 's' : ''} late`;
}

export default function StudentDashboard() {
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

  const [enrollments, setEnrollments] = useState([]);
  const [analytics,   setAnalytics]   = useState(null);
  const [events,      setEvents]      = useState([]);   // upcoming
  const [overdueEvs,  setOverdueEvs]  = useState([]);   // overdue / late
  const [loading,     setLoading]     = useState(true);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [calYear,     setCalYear]     = useState(today.getFullYear());
  const [calMonth,    setCalMonth]    = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [timeFilter,  setTimeFilter]  = useState('7');
  const [calModal,    setCalModal]    = useState(null);   // {assignment, submitText}
  const [submitting,  setSubmitting]  = useState(false);
  const [submitText,  setSubmitText]  = useState('');
  const [search,      setSearch]      = useState('');
  const [sortBy,      setSortBy]      = useState('date');

  useEffect(() => {
    const load = async () => {
      try {
        const [eRes, aRes] = await Promise.all([enrollAPI.getMyEnroll(), analyticsAPI.student()]);
        setEnrollments(eRes.data);
        setAnalytics(aRes.data);
        const allEvents = [];
        const overdue   = [];
        for (const enr of eRes.data) {
          const cId = enr.courseId?._id || enr.courseId;
          if (!cId) continue;
          try {
            const [asnRes, qzRes] = await Promise.all([
              assignAPI.getByCourse(cId), quizAPI.getByCourse(cId),
            ]);
            (asnRes.data || []).forEach(a => {
              if (a.dueDate) {
                const ev = {
                  id:a._id, type:'assignment', title:a.title,
                  courseName: a.courseName || enr.courseId?.title || enr.courseName || 'Course',
                  date:new Date(a.dueDate),
                  assignmentObj: a,
                };
                if (new Date(a.dueDate) < today && !a.mySubmission) {
                  // Overdue and not submitted
                  overdue.push({ ...ev, overdue: true });
                } else if (a.mySubmission?.status === 'late' || a.mySubmission?.status === 'submitted') {
                  // Show late label if applicable
                  const late = lateLabel(a.dueDate, a.mySubmission?.submittedAt);
                  if (late) overdue.push({ ...ev, late: true, lateLabel: late });
                } else {
                  allEvents.push(ev);
                }
              }
            });
            (qzRes.data || []).forEach(q => {
              const date = q.dueDate ? new Date(q.dueDate) : new Date(q.createdAt);
              const ev = {
                id:q._id, type:'quiz', title:q.title,
                courseName: q.courseName || enr.courseId?.title || enr.courseName || 'Course',
                date, quizObj: q,
              };
              if (q.dueDate && new Date(q.dueDate) < today && !(q.attempts||[]).length) {
                overdue.push({ ...ev, overdue: true });
              } else {
                allEvents.push(ev);
              }
            });
          } catch {}
        }
        setEvents(allEvents);
        setOverdueEvs(overdue);
      } catch {}
      // Load submission timeline
      try {
        const tlRes = await timelineAPI.get();
        setActivityTimeline(tlRes.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Calendar
  const calDays = useMemo(() => {
    const first = new Date(calYear, calMonth, 1);
    let off = first.getDay()-1; if(off<0) off=6;
    const dim = new Date(calYear,calMonth+1,0).getDate();
    const dip = new Date(calYear,calMonth,0).getDate();
    const cells=[];
    for(let i=off-1;i>=0;i--) cells.push({day:dip-i,current:false,date:null});
    for(let d=1;d<=dim;d++) cells.push({day:d,current:true,date:new Date(calYear,calMonth,d)});
    while(cells.length%7!==0) cells.push({day:cells.length-dim-off+1,current:false,date:null});
    return cells;
  },[calYear,calMonth]);

  const eventsOnDate = d => !d ? [] : events.filter(e=>
    e.date.getFullYear()===d.getFullYear()&&e.date.getMonth()===d.getMonth()&&e.date.getDate()===d.getDate()
  );
  const isToday = d => d && d.toDateString()===today.toDateString();
  const prevMonth = ()=>{ if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); setSelectedDay(null); };
  const nextMonth = ()=>{ if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); setSelectedDay(null); };

  const days = parseInt(timeFilter);
  const timelineEvents = useMemo(()=>{
    const now=new Date(); const lim=new Date(now.getTime()+days*86400000);
    return events
      .filter(e=>e.date>=now&&e.date<=lim&&(!search||e.title.toLowerCase().includes(search.toLowerCase())||e.courseName.toLowerCase().includes(search.toLowerCase())))
      .sort((a,b)=>sortBy==='date'?a.date-b.date:a.title.localeCompare(b.title));
  },[events,days,search,sortBy]);

  const handleCalSubmit = async () => {
    if (!calModal?.assignment || !submitText.trim()) return;
    setSubmitting(true);
    try {
      const { assignAPI } = await import('../../services/api');
      await assignAPI.submit(calModal.assignment._id || calModal.assignment.id, { content: submitText });
      const { toast } = await import('react-toastify');
      toast.success(`"${calModal.assignment.title}" submitted successfully!`);
      setCalModal(null); setSubmitText('');
      // Refresh events
      window.location.reload();
    } catch (err) {
      const { toast } = await import('react-toastify');
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const groupedTimeline = useMemo(()=>{
    const map={};
    timelineEvents.forEach(ev=>{
      const key=ev.date.toDateString();
      if(!map[key]) map[key]={date:ev.date, events:[]};
      map[key].events.push(ev);
    });
    return Object.values(map).sort((a,b)=>a.date-b.date);
  },[timelineEvents]);

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <CircularProgress size={32}/>
    </Box>
  );

  return (
    <Box sx={{ maxWidth:1200, mx:'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ color:txt, mb:3 }}>
        Hi, {user?.name?.split(' ')[0]}! 👋
      </Typography>

      {/* Stats */}
      <Card sx={{ bgcolor:surface, border:`1px solid ${border}`, borderRadius:3,
        boxShadow:'none', mb:3 }}>
        <CardContent sx={{ py:3, px:4 }}>
          <Box sx={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'space-around' }}>
            <UolStat icon={<MenuBook/>}    value={enrollments.length||0}            label="Courses Enrolled"/>
            <UolStat icon={<CheckCircle/>} value={analytics?.completedCourses||0}   label="Courses Completed"/>
            <UolStat icon={<Assignment/>}  value={analytics?.activitiesCompleted||0} label="Activities Completed"/>
            <UolStat icon={<Schedule/>}    value={timelineEvents.length}             label="Activities Due"/>
          </Box>
        </CardContent>
      </Card>

      {/* Activity Timeline / Submission History */}
      {activityTimeline.length > 0 && (
        <Card sx={{ bgcolor:surface, border:`1px solid ${border}`, borderRadius:3, boxShadow:'none', mb:3 }}>
          <CardContent sx={{ p:3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color:txt, mb:2 }}>
              📋 Recent Activity
            </Typography>
            <Box sx={{ display:'flex', flexDirection:'column', gap:1.5, maxHeight:220, overflowY:'auto' }}>
              {activityTimeline.slice(0,8).map((act, i) => (
                <Box key={i} sx={{ display:'flex', gap:2, p:1.5, bgcolor:hover, borderRadius:2 }}>
                  <Box sx={{ width:8, borderRadius:1, flexShrink:0,
                    bgcolor: act.status==='late'?'#F59E0B': act.status==='graded'?'#10B981':'#3B82F6' }}/>
                  <Box sx={{ flex:1, minWidth:0 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color:txt, noWrap:true }}>
                      {act.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color:sub }}>
                      {act.courseName} • Week {act.weekNumber} •{' '}
                      <span style={{ color: act.status==='late'?'#F59E0B': act.status==='graded'?'#10B981':'#3B82F6', fontWeight:600 }}>
                        {act.status === 'submitted' ? 'Submitted' : act.status === 'late' ? 'Late Submission' : 'Graded'}
                      </span>
                    </Typography>
                    <Typography variant="caption" sx={{ color:sub, display:'block' }}>
                      {act.submittedAt ? new Date(act.submittedAt).toLocaleString('en-PK', { dateStyle:'medium', timeStyle:'short' }) : ''}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Overdue / Late submissions */}
      {overdueEvs.length > 0 && (
        <Card sx={{ bgcolor: isDark?'#3f1515':'#FEF2F2', border:`1px solid #FECACA`,
          borderRadius:3, boxShadow:'none', mb:3 }}>
          <CardContent sx={{ p:3 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
              <Warning sx={{ color:'#EF4444', fontSize:20 }}/>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color:'#EF4444' }}>
                Overdue / Late ({overdueEvs.length})
              </Typography>
            </Box>
            {overdueEvs.map((ev,i) => (
              <Box key={i} sx={{ display:'flex', alignItems:'center', gap:2, px:2, py:1.5,
                bgcolor: isDark?'#4f1f1f':'#fff',
                borderRadius:2, mb:1, border:`1px solid #FECACA` }}>
                <Box sx={{ width:32, height:32, borderRadius:2, bgcolor:'#FEE2E2',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {ev.type==='assignment'
                    ? <Assignment sx={{ fontSize:16, color:'#EF4444' }}/>
                    : <Quiz sx={{ fontSize:16, color:'#EF4444' }}/>}
                </Box>
                <Box sx={{ flex:1, minWidth:0 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: isDark?'#F9FAFB':'#111827' }}>
                    {ev.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color:'#EF4444', fontWeight:600 }}>
                    {ev.lateLabel || `Overdue since ${ev.date.toLocaleDateString('en-PK',{ day:'numeric', month:'short' })}`}
                  </Typography>
                </Box>
                <Chip label="LATE" size="small"
                  sx={{ bgcolor:'#EF4444', color:'#fff', fontWeight:800, fontSize:'0.6rem' }}/>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card sx={{ bgcolor:surface, border:`1px solid ${border}`, borderRadius:3, boxShadow:'none', mb:3 }}>
        <CardContent sx={{ p:3 }}>
          <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:2.5, flexWrap:'wrap', gap:1 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color:txt }}>Timeline</Typography>
            <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
              <Select size="small" value={timeFilter} onChange={e=>setTimeFilter(e.target.value)}
                sx={{ bgcolor:hover, '& .MuiOutlinedInput-notchedOutline':{border:'none'}, color:txt, borderRadius:2, fontSize:'0.8rem', minWidth:130 }}>
                <MenuItem value="7">Next 7 days</MenuItem>
                <MenuItem value="14">Next 14 days</MenuItem>
                <MenuItem value="30">Next 30 days</MenuItem>
              </Select>
              <Select size="small" value={sortBy} onChange={e=>setSortBy(e.target.value)}
                sx={{ bgcolor:hover, '& .MuiOutlinedInput-notchedOutline':{border:'none'}, color:txt, borderRadius:2, fontSize:'0.8rem', minWidth:120 }}>
                <MenuItem value="date">Sort by dates</MenuItem>
                <MenuItem value="title">Sort by name</MenuItem>
              </Select>
              <TextField size="small" placeholder="Search…" value={search}
                onChange={e=>setSearch(e.target.value)}
                InputProps={{ startAdornment:<InputAdornment position="start"><Search sx={{ fontSize:16, color:sub }}/></InputAdornment> }}
                sx={{ width:240, '& .MuiOutlinedInput-root':{ bgcolor:hover, '& fieldset':{border:'none'}, borderRadius:2 }, '& input':{ color:txt, fontSize:'0.8rem' } }}
              />
            </Box>
          </Box>

          {groupedTimeline.length===0 ? (
            <Box sx={{ textAlign:'center', py:6, borderRadius:2, border:`1px solid ${border}` }}>
              <CalendarMonth sx={{ fontSize:40, color:border, mb:1 }}/>
              <Typography variant="body2" sx={{ color:sub }}>No upcoming activities in this period</Typography>
            </Box>
          ) : groupedTimeline.map(group=>(
            <Box key={group.date.toDateString()} sx={{ mb:2 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color:txt, mb:1.5 }}>
                {group.date.toLocaleDateString('en-PK',{ weekday:'long', day:'numeric', month:'long', year:'numeric' })}
              </Typography>
              <Card sx={{ bgcolor:surface, border:`1px solid ${border}`, borderRadius:2, boxShadow:'none' }}>
                {group.events.map((ev,i)=>(
                  <Box key={ev.id} sx={{
                    display:'flex', alignItems:'center', gap:2, px:3, py:2,
                    borderBottom: i<group.events.length-1 ? `1px solid ${border}` : 'none',
                  }}>
                    <Box sx={{ width:36, height:36, borderRadius:2, bgcolor: ev.type==='assignment'?'#fff0f3':'#f5f0ff',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {ev.type==='assignment'
                        ? <Assignment sx={{ fontSize:18, color:'#e91e63' }}/>
                        : <Quiz sx={{ fontSize:18, color:'#7c3aed' }}/>}
                    </Box>
                    <Box sx={{ flex:1, minWidth:0 }}>
                      <Typography variant="body1" fontWeight={700} sx={{ color:txt }}>{ev.title}</Typography>
                      <Typography variant="body2" sx={{ color:sub }}>
                        {ev.courseName} — <strong>{ev.type==='assignment'?'Assignment is due':'Quiz closes'}</strong>
                      </Typography>
                      <Typography variant="caption" sx={{ color:sub }}>
                        {ev.date.toLocaleTimeString('en-PK',{ hour:'2-digit', minute:'2-digit', hour12:false })}
                      </Typography>
                    </Box>
                    {/* Deadline badge */}
                    <Chip
                      label={`Due: ${ev.date.toLocaleDateString('en-PK',{ day:'numeric', month:'short' })}`}
                      size="small"
                      sx={{ bgcolor: isDark?'#374151':'#F3F4F6', color: sub, fontSize:'0.68rem', fontWeight:600, mr:1 }}
                    />
                    <Button variant="outlined" size="small"
                      onClick={() => navigate(ev.type==='assignment'?'/student/assignments':'/student/quizzes')}
                      sx={{ flexShrink:0,
                        color: ev.type==='assignment'?'#e91e63':'#7c3aed',
                        borderColor: ev.type==='assignment'?'#e91e63':'#7c3aed',
                        borderRadius:2, fontSize:'0.78rem', fontWeight:700,
                        '&:hover':{ bgcolor: ev.type==='assignment'?'#fff0f3':'#f5f0ff' } }}>
                      {ev.type==='assignment'?'Attempt':'Attempt Quiz'}
                    </Button>
                  </Box>
                ))}
              </Card>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card sx={{ bgcolor:surface, border:`1px solid ${border}`, borderRadius:3, boxShadow:'none' }}>
        <CardContent sx={{ p:3 }}>
          <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:2 }}>
            <IconButton size="small" onClick={prevMonth} sx={{ color:sub }}><ChevronLeft/></IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ color:txt }}>{MONTHS[calMonth]} {calYear}</Typography>
            <IconButton size="small" onClick={nextMonth} sx={{ color:sub }}><ChevronRight/></IconButton>
          </Box>
          <Grid container columns={7} sx={{ mb:0.5 }}>
            {DAYS.map(d=>(
              <Grid item xs={1} key={d}>
                <Typography sx={{ textAlign:'center', fontSize:'0.72rem', fontWeight:700, color:sub, pb:0.5 }}>{d}</Typography>
              </Grid>
            ))}
          </Grid>
          <Grid container columns={7}>
            {calDays.map((cell,idx)=>{
              const de=cell.date?eventsOnDate(cell.date):[];
              const isSel=selectedDay&&cell.date&&selectedDay.toDateString()===cell.date.toDateString();
              return (
                <Grid item xs={1} key={idx}>
                  <Box onClick={()=>cell.current&&cell.date&&setSelectedDay(isSel?null:cell.date)}
                    sx={{ minHeight:56, p:0.4, cursor:cell.current?'pointer':'default',
                      borderRadius:1.5, bgcolor:isSel?hover:'transparent',
                      border:isSel?`1px solid ${border}`:'1px solid transparent',
                      '&:hover':cell.current?{bgcolor:hover}:{}, transition:'all 0.12s' }}>
                    <Box sx={{ display:'flex', justifyContent:'center', mb:0.3 }}>
                      <Box sx={{ width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                        bgcolor:isToday(cell.date)?(isDark?'#374151':'#1F2937'):'transparent' }}>
                        <Typography sx={{ fontSize:'0.72rem', fontWeight:isToday(cell.date)?700:400,
                          color:!cell.current?(isDark?'#4B5563':'#D1D5DB'):isToday(cell.date)?'#fff':txt }}>
                          {cell.day}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display:'flex', flexDirection:'column', gap:0.2 }}>
                      {de.slice(0,2).map((ev,i)=>(
                        <Box key={i} sx={{ bgcolor:ev.type==='assignment'?'#e91e6320':'#7c3aed20', borderRadius:0.5, px:0.4 }}>
                          <Typography sx={{ fontSize:'0.52rem', color:ev.type==='assignment'?'#e91e63':'#7c3aed',
                            fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                            {ev.type==='assignment'?'📝':'🧠'} {ev.title}
                          </Typography>
                        </Box>
                      ))}
                      {de.length>2&&<Typography sx={{ fontSize:'0.5rem', color:sub, pl:0.3 }}>+{de.length-2}</Typography>}
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
          {selectedDay&&(
            <Box sx={{ mt:2, pt:2, borderTop:`1px solid ${border}` }}>
              <Typography variant="caption" fontWeight={700} sx={{ color:sub, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                {selectedDay.toLocaleDateString('en-PK',{ weekday:'long', day:'numeric', month:'long' })}
              </Typography>
              {eventsOnDate(selectedDay).length===0
                ? <Typography variant="body2" sx={{ color:sub, mt:1 }}>No activities.</Typography>
                : eventsOnDate(selectedDay).map((ev,i)=>(
                  <Box key={i} onClick={()=>ev.type==='assignment'&&!ev.assignmentObj?.mySubmission&&setCalModal({assignment:ev.assignmentObj, title:ev.title, courseName:ev.courseName})}
                    sx={{ display:'flex', gap:1.5, mt:1.5, p:1.5, bgcolor:hover, borderRadius:2,
                      cursor:ev.type==='assignment'&&!ev.assignmentObj?.mySubmission?'pointer':'default',
                      '&:hover':{ bgcolor: ev.type==='assignment'&&!ev.assignmentObj?.mySubmission ? border : hover },
                      border:`1px solid ${ev.type==='assignment'&&!ev.assignmentObj?.mySubmission?'#e91e6340':'transparent'}`,
                    }}>
                    <Box sx={{ width:6, borderRadius:1, bgcolor:ev.type==='assignment'?'#e91e63':'#7c3aed', flexShrink:0 }}/>
                    <Box sx={{ flex:1 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ color:txt }}>{ev.title}</Typography>
                      <Typography variant="caption" sx={{ color:sub }}>{ev.courseName}</Typography>
                      {ev.type==='assignment'&&(
                        ev.assignmentObj?.mySubmission
                          ? <Typography variant="caption" sx={{ color:'#16A34A', display:'block', mt:0.3 }}>✓ Submitted</Typography>
                          : <Typography variant="caption" sx={{ color:'#e91e63', display:'block', mt:0.3 }}>Click to submit →</Typography>
                      )}
                    </Box>
                  </Box>
                ))
              }
            </Box>
          )}
        </CardContent>
      </Card>
      {/* Assignment Submit Modal from Calendar */}
      {calModal && (
        <Box sx={{ position:'fixed', inset:0, bgcolor:'rgba(0,0,0,0.5)', zIndex:1300,
          display:'flex', alignItems:'center', justifyContent:'center', p:2 }}>
          <Box sx={{ bgcolor:surface, borderRadius:3, p:4, maxWidth:480, width:'100%',
            boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
            <Typography variant="h6" fontWeight={800} sx={{ color:txt, mb:0.5 }}>Submit Assignment</Typography>
            <Typography variant="body2" sx={{ color:sub, mb:2 }}>
              <strong>{calModal.title}</strong> — {calModal.courseName}
            </Typography>
            <TextField
              label="Your Answer / Submission" multiline rows={4} fullWidth
              value={submitText} onChange={e=>setSubmitText(e.target.value)}
              sx={{ mb:3 }} placeholder="Write your answer or paste your submission content here..."
            />
            <Box sx={{ display:'flex', gap:2, justifyContent:'flex-end' }}>
              <Button variant="outlined" onClick={()=>{setCalModal(null);setSubmitText('');}}
                sx={{ borderRadius:2, fontWeight:600 }}>Cancel</Button>
              <Button variant="contained" onClick={handleCalSubmit} disabled={submitting||!submitText.trim()}
                sx={{ borderRadius:2, fontWeight:700, bgcolor:'#111827', '&:hover':{bgcolor:'#1F2937'} }}>
                {submitting ? <CircularProgress size={18} color="inherit"/> : 'Submit'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}