import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Table,
  TableBody, TableCell, TableHead, TableRow, Avatar, LinearProgress,
  CircularProgress,
} from '@mui/material';
import { People, School, TrendingUp, Assignment } from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { analyticsAPI } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';

const COLORS = ['#4a148c', '#1565c0', '#00838f', '#e65100', '#2e7d32'];

export default function InstructorAnalytics() {
  const { mode } = useThemeMode();
  const isDark   = mode === 'dark';
  const surface  = isDark ? '#1F2937' : '#fff';
  const border   = isDark ? '#374151' : '#E5E7EB';
  const txt      = isDark ? '#F9FAFB' : '#111827';
  const sub      = isDark ? '#9CA3AF' : '#6B7280';

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.instructor()
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  // ── If no data at all ───────────────────────────────────────────────
  if (!data) return (
    <Box>
      <PageHeader title="Analytics" subtitle="Performance insights for your courses" />
      <Box sx={{ textAlign: 'center', py: 10, color: sub }}>
        <Typography>Could not load analytics. Please try again.</Typography>
      </Box>
    </Box>
  );

  const {
    totalCourses = 0, totalStudents = 0, completionRate = 0, avgGrade = 0,
    monthlyEnrollments = [], courseScores = [], studentsByCourse = [],
    topStudents = [],
  } = data;

  const noData = totalStudents === 0 && totalCourses === 0;

  return (
    <Box>
      <PageHeader title="Analytics" subtitle="Performance insights for your courses — real data from your students" />

      {/* ── Stat cards — real numbers ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Students',   value: String(totalStudents),       icon: <People />,    color: '#4a148c', trend: null },
          { title: 'Active Courses',   value: String(totalCourses),        icon: <School />,    color: '#1a237e', trend: null },
          { title: 'Avg. Grade',       value: avgGrade ? `${avgGrade}%` : '—', icon: <Assignment />, color: '#00897b', trend: null },
          { title: 'Completion Rate',  value: `${completionRate}%`,        icon: <TrendingUp />, color: '#e65100', trend: null },
        ].map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {noData ? (
        <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 3, boxShadow: 'none' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: sub, mb: 1 }}>No data yet</Typography>
            <Typography variant="body2" sx={{ color: sub }}>
              Charts and tables will appear here once students enroll in your courses and submit assignments.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>

          {/* Monthly Enrollments — real */}
          <Grid item xs={12} md={7}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 3, boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: txt }}>
                  Monthly Enrollments
                </Typography>
                {monthlyEnrollments.every(m => m.count === 0) ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body2" sx={{ color: sub }}>No enrollments in the last 6 months.</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={monthlyEnrollments}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: sub }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: sub }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 8 }}
                        labelStyle={{ color: txt }} itemStyle={{ color: '#4a148c' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#4a148c" strokeWidth={3}
                        dot={{ fill: '#4a148c', r: 4 }} name="Enrollments" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Students by Course pie — real */}
          <Grid item xs={12} md={5}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 3, boxShadow: 'none', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: txt }}>
                  Students by Course
                </Typography>
                {studentsByCourse.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body2" sx={{ color: sub }}>No enrolled students yet.</Typography>
                  </Box>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={studentsByCourse} cx="50%" cy="50%" outerRadius={65}
                          dataKey="value" paddingAngle={3}>
                          {studentsByCourse.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 8 }}
                          labelStyle={{ color: txt }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {studentsByCourse.map((d, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                          <Typography variant="caption" sx={{ color: txt }}>{d.name}</Typography>
                        </Box>
                        <Typography variant="caption" fontWeight={700} sx={{ color: txt }}>{d.value}</Typography>
                      </Box>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Avg Score by Course bar — real */}
          <Grid item xs={12} md={5}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 3, boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: txt }}>
                  Avg. Score by Course
                </Typography>
                {courseScores.length === 0 || courseScores.every(c => c.score === 0) ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body2" sx={{ color: sub }}>No graded assignments yet.</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(160, courseScores.length * 55)}>
                    <BarChart data={courseScores} layout="vertical">
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: sub }}
                        axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: sub }}
                        axisLine={false} tickLine={false} width={110}
                        tickFormatter={v => v.length > 14 ? v.substring(0, 14) + '…' : v} />
                      <Tooltip
                        formatter={v => [`${v}%`]}
                        contentStyle={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 8 }}
                        labelStyle={{ color: txt }}
                      />
                      <Bar dataKey="score" fill="#4a148c" radius={[0, 6, 6, 0]} name="Avg Score" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Top Students — real */}
          <Grid item xs={12} md={7}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 3, boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: txt }}>
                  Top Students
                </Typography>
                {topStudents.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body2" sx={{ color: sub }}>No student data yet.</Typography>
                  </Box>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { color: sub, fontWeight: 700, fontSize: '0.72rem',
                        textTransform: 'uppercase', letterSpacing: '0.05em', bgcolor: isDark ? '#111827' : '#F9FAFB' } }}>
                        <TableCell>Student</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell>Grade</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topStudents.map((s, i) => (
                        <TableRow key={i} sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 30, height: 30, bgcolor: '#4a148c', fontSize: 13 }}>
                                {s.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="caption" fontWeight={600} display="block" sx={{ color: txt }}>
                                  {s.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: sub }}>{s.course}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress variant="determinate" value={s.progress}
                                sx={{ flex: 1, height: 5, borderRadius: 3,
                                  bgcolor: isDark ? '#374151' : '#e5e7eb',
                                  '& .MuiLinearProgress-bar': { bgcolor: '#4a148c' } }} />
                              <Typography variant="caption" sx={{ color: txt }}>{s.progress}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {s.grade !== null ? (
                              <Chip label={`${s.grade}%`} size="small" color="success" variant="outlined"
                                sx={{ fontWeight: 700 }} />
                            ) : (
                              <Typography variant="caption" sx={{ color: sub }}>No grade</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      )}
    </Box>
  );
}