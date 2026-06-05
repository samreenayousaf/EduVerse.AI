import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, LinearProgress,
  CircularProgress, Chip, Button, Avatar,
} from '@mui/material';
import {
  TrendingUp, CheckCircle, School, EmojiEvents,
  Assignment, Quiz, Star,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';
import { enrollAPI, analyticsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#1a237e','#00897b','#6a1b9a','#e65100','#00838f'];

export default function StudentProgress() {
  const { user }     = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [analytics,   setAnalytics]   = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [eRes, aRes] = await Promise.all([
          enrollAPI.getMyEnroll(),
          analyticsAPI.student(),
        ]);
        setEnrollments(eRes.data);
        setAnalytics(aRes.data);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <CircularProgress size={48}/>
    </Box>
  );

  const chartData = enrollments.map(e => ({
    name: (e.courseId?.title || e.courseName || '').substring(0,16) + '…',
    progress: e.progress || 0,
  }));

  const statusData = [
    { name:'Active',    value: enrollments.filter(e => e.status === 'active').length    || 0 },
    { name:'Completed', value: enrollments.filter(e => e.status === 'completed').length || 0 },
    { name:'Dropped',   value: enrollments.filter(e => e.status === 'dropped').length   || 0 },
  ].filter(d => d.value > 0);

  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s,e) => s + (e.progress||0), 0) / enrollments.length) : 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb:1 }}>My Progress</Typography>
      <Typography color="text.secondary" sx={{ mb:3 }}>
        Track your learning journey
      </Typography>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb:4 }}>
        {[
          { label:'Enrolled',  value: enrollments.length,                                          color:'#1a237e', icon:<School/>    },
          { label:'Completed', value: enrollments.filter(e=>e.status==='completed').length,        color:'#00897b', icon:<CheckCircle/>},
          { label:'Avg Progress', value:`${avgProgress}%`,                                         color:'#6a1b9a', icon:<TrendingUp/>  },
          { label:'Avg Grade',    value:`${analytics?.avgGrade || 0}%`,                            color:'#e65100', icon:<Star/>        },
        ].map((s,i) => (
          <Grid item xs={6} md={3} key={i}>
            <Card sx={{ p:2.5, borderRadius:3, textAlign:'center' }}>
              <Box sx={{ width:44, height:44, borderRadius:2, bgcolor:`${s.color}15`,
                display:'flex', alignItems:'center', justifyContent:'center', mx:'auto', mb:1.5 }}>
                {React.cloneElement(s.icon, { sx:{ color:s.color, fontSize:22 } })}
              </Box>
              <Typography variant="h5" fontWeight={800} sx={{ color:s.color }}>
                {s.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Progress Chart */}
        {chartData.length > 0 && (
          <Grid item xs={12} md={7}>
            <Card sx={{ p:3, borderRadius:3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Course Progress</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top:5, right:10, left:-20, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="name" tick={{ fontSize:11 }}/>
                  <YAxis domain={[0,100]} tick={{ fontSize:11 }}/>
                  <Tooltip formatter={v => [`${v}%`, 'Progress']}/>
                  <Bar dataKey="progress" fill="#1a237e" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        )}

        {/* Status Pie */}
        {statusData.length > 0 && (
          <Grid item xs={12} md={5}>
            <Card sx={{ p:3, borderRadius:3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Course Status</Typography>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50}
                    outerRadius={80} dataKey="value" label={({name,value})=>`${name}: ${value}`}
                    labelLine={false}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        )}

        {/* Course Cards */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={700} sx={{ mb:2 }}>All Enrollments</Typography>
          {enrollments.length === 0 ? (
            <Card sx={{ p:6, textAlign:'center', borderRadius:3 }}>
              <School sx={{ fontSize:64, color:'#ccc', mb:2 }}/>
              <Typography color="text.secondary">No enrollments yet.</Typography>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {enrollments.map(e => {
                const progress = e.progress || 0;
                const title    = e.courseId?.title || e.courseName || 'Course';
                const instructor = e.instructorName || '';
                const completed  = e.completedLectures?.length || 0;
                const isCompleted = e.status === 'completed';
                return (
                  <Grid item xs={12} sm={6} md={4} key={e._id}>
                    <Card sx={{ p:2.5, borderRadius:3,
                      border: isCompleted ? '2px solid #00897b' : '1px solid #f0f0f0' }}>
                      {isCompleted && (
                        <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:1 }}>
                          <EmojiEvents sx={{ color:'#ffd700', fontSize:18 }}/>
                          <Typography variant="caption" fontWeight={700} sx={{ color:'#00897b' }}>
                            Course Completed!
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom noWrap>
                        {title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb:1.5 }}>
                        {instructor}
                      </Typography>
                      <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                        <Typography variant="caption" color="text.secondary">Progress</Typography>
                        <Typography variant="caption" fontWeight={700}>{progress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={progress}
                        sx={{ height:8, borderRadius:4, mb:1.5,
                          '& .MuiLinearProgress-bar':{
                            bgcolor: isCompleted ? '#00897b' : '#1a237e' } }}/>
                      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {completed} lectures done
                        </Typography>
                        <Chip label={e.status || 'active'} size="small"
                          color={isCompleted ? 'success' : 'primary'}
                          variant="outlined"
                          sx={{ fontSize:'0.65rem', textTransform:'capitalize' }}/>
                      </Box>
                      {isCompleted && (
                        <Button fullWidth variant="outlined" size="small" sx={{ mt:1.5, color:'#00897b', borderColor:'#00897b' }}
                          startIcon={<EmojiEvents/>}>
                          View Certificate
                        </Button>
                      )}
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
