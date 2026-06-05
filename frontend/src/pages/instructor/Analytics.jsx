import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Table,
  TableBody, TableCell, TableHead, TableRow, Avatar, LinearProgress,
  CircularProgress, Alert,
} from '@mui/material';
import { People, School, TrendingUp, Assignment } from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import StatCard   from '../../components/common/StatCard';
import { analyticsAPI } from '../../services/api';

const COLORS = ['#4a148c','#1565c0','#00838f','#e65100','#2e7d32','#6a1b9a'];

export default function InstructorAnalytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    analyticsAPI.instructor()
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load analytics data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box>
      <PageHeader title="Analytics" subtitle="Performance insights for your courses" />
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  const {
    totalCourses    = 0,
    totalStudents   = 0,
    avgGrade        = 0,
    completionRate  = 0,
    coursePerf      = [],
    studentsByCourse= [],
    monthlyEnroll   = [],
    topStudents     = [],
  } = data || {};

  const hasGradeData   = coursePerf.length > 0;
  const hasStudentData = studentsByCourse.some(s => s.value > 0);
  const hasTopStudents = topStudents.length > 0;
  const hasEnrollData  = monthlyEnroll.some(m => m.count > 0);

  return (
    <Box>
      <PageHeader title="Analytics" subtitle="Performance insights for your courses" />

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb:4 }}>
        {[
          { title:'Total Students',  value: String(totalStudents),   icon:<People />,    color:'#4a148c', trend: totalStudents > 0 ? 5 : 0 },
          { title:'Active Courses',  value: String(totalCourses),    icon:<School />,    color:'#1a237e', trend: 0 },
          { title:'Avg. Grade',      value: avgGrade ? `${avgGrade}%` : '—',  icon:<Assignment />, color:'#00897b', trend: 0 },
          { title:'Completion Rate', value: `${completionRate}%`,    icon:<TrendingUp />,color:'#e65100', trend: 0 },
        ].map((s,i) => <Grid item xs={12} sm={6} md={3} key={i}><StatCard {...s} /></Grid>)}
      </Grid>

      <Grid container spacing={3}>

        {/* Monthly Enrollments */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p:3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Monthly Enrollments</Typography>
              {hasEnrollData ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={monthlyEnroll}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize:12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize:12 }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#4a148c" strokeWidth={3}
                      dot={{ fill:'#4a148c', r:4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height:240, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Typography color="text.secondary" variant="body2">No enrollment data yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Students by Course Pie */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height:'100%' }}>
            <CardContent sx={{ p:3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Students by Course</Typography>
              {hasStudentData ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={studentsByCourse} cx="50%" cy="50%" outerRadius={65}
                        dataKey="value" paddingAngle={3}>
                        {studentsByCourse.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, 'Students']} />
                    </PieChart>
                  </ResponsiveContainer>
                  {studentsByCourse.map((d, i) => (
                    <Box key={i} sx={{ display:'flex', justifyContent:'space-between', mt:1 }}>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                        <Box sx={{ width:10, height:10, borderRadius:'50%', bgcolor:COLORS[i % COLORS.length] }} />
                        <Typography variant="caption">{d.name}</Typography>
                      </Box>
                      <Typography variant="caption" fontWeight={700}>{d.value}</Typography>
                    </Box>
                  ))}
                </>
              ) : (
                <Box sx={{ height:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Typography color="text.secondary" variant="body2">No students enrolled yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Avg Score by Course */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ p:3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Avg. Score by Course</Typography>
              {hasGradeData ? (
                <ResponsiveContainer width="100%" height={Math.max(200, coursePerf.length * 55)}>
                  <BarChart data={coursePerf} layout="vertical">
                    <XAxis type="number" domain={[0,100]} tick={{ fontSize:11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize:11 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip formatter={v => [`${v}%`, 'Avg Score']} />
                    <Bar dataKey="score" fill="#4a148c" radius={[0,6,6,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1 }}>
                  <Typography color="text.secondary" variant="body2">No graded assignments yet</Typography>
                  <Typography color="text.secondary" variant="caption">Grade student submissions to see scores here</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Students */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p:3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Top Students</Typography>
              {hasTopStudents ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight:700, fontSize:'0.75rem', color:'#6B7280', textTransform:'uppercase' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight:700, fontSize:'0.75rem', color:'#6B7280', textTransform:'uppercase' }}>Progress</TableCell>
                      <TableCell sx={{ fontWeight:700, fontSize:'0.75rem', color:'#6B7280', textTransform:'uppercase' }}>Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topStudents.map((s,i) => (
                      <TableRow key={i} sx={{ '&:last-child td':{ border:0 } }}>
                        <TableCell>
                          <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                            <Avatar sx={{ width:30, height:30, bgcolor:'#4a148c', fontSize:13 }}>
                              {s.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="caption" fontWeight={600} display="block">{s.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{s.course}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                            <LinearProgress variant="determinate" value={s.progress}
                              sx={{ flex:1, height:5, borderRadius:3 }} />
                            <Typography variant="caption">{s.progress}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={s.grade} size="small" color="success" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box sx={{ py:4, textAlign:'center' }}>
                  <Typography color="text.secondary" variant="body2">No graded submissions yet</Typography>
                  <Typography color="text.secondary" variant="caption">Grade assignments to see top students here</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}