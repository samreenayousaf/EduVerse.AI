import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, Avatar, Chip, Button, LinearProgress,
} from '@mui/material';
import {
  People, School, Assignment, TrendingUp, Refresh,
  CheckCircle, PersonAdd, MenuBook, BarChart,
} from '@mui/icons-material';
import {
  BarChart as RBarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { analyticsAPI, adminAPI } from '../../services/api';

const COLORS = ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#4B5563', '#1F2937'];

function StatCard({ icon, value, label, sub, surface, border, txt }) {
  return (
    <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 3, boxShadow: 'none', height: '100%' }}>
      <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ color: sub, bgcolor: `${border}`, p: 1.2, borderRadius: 2 }}>
          {React.cloneElement(icon, { sx: { fontSize: 22, color: txt } })}
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: txt, lineHeight: 1 }}>{value}</Typography>
          <Typography variant="body2" sx={{ color: sub, mt: 0.3, fontSize: '0.78rem' }}>{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user }  = useAuth();
  const { mode }  = useThemeMode();
  const isDark    = mode === 'dark';

  const surface = isDark ? '#1F2937' : '#FFFFFF';
  const border  = isDark ? '#374151' : '#E5E7EB';
  const txt     = isDark ? '#F9FAFB' : '#111827';
  const sub     = isDark ? '#9CA3AF' : '#6B7280';
  const hover   = isDark ? '#374151' : '#F9FAFB';

  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, uRes] = await Promise.all([analyticsAPI.admin(), adminAPI.getUsers()]);
      setStats(sRes.data);
      setUsers(uRes.data.slice(0, 10));
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress size={48} />
    </Box>
  );

  const catData     = stats?.coursesByCategory || [];
  const totalUsers  = stats?.totalUsers        || 0;
  const students    = stats?.totalStudents     || 0;
  const instructors = stats?.totalInstructors  || 0;
  const admins      = Math.max(0, totalUsers - students - instructors);

  // Pie data for user roles
  const roleData = [
    { name: 'Students',    value: students    },
    { name: 'Instructors', value: instructors },
    { name: 'Admins',      value: admins      },
  ].filter(d => d.value > 0);

  // Enrollment rate per course (from catData we derive published vs total)
  const publishedCourses = stats?.publishedCourses || 0;
  const totalCourses     = stats?.totalCourses     || 0;
  const draftCourses     = totalCourses - publishedCourses;

  const courseStatusData = [
    { name: 'Published', value: publishedCourses },
    { name: 'Draft',     value: draftCourses     },
  ].filter(d => d.value > 0);

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto' }}>
      {/* Greeting */}
      <Typography variant="h5" fontWeight={800} sx={{ color: txt, mb: 3 }}>
        Hi, {user?.name?.split(' ')[0]}! 👋
      </Typography>

      {/* ── Stat cards row ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { icon: <People />,     value: totalUsers,                  label: 'Total Users'       },
          { icon: <School />,     value: stats?.totalCourses || 0,    label: 'Total Courses'     },
          { icon: <PersonAdd />,  value: students,                    label: 'Students'          },
          { icon: <MenuBook />,   value: instructors,                 label: 'Instructors'       },
          { icon: <TrendingUp />, value: stats?.totalEnrollments || 0,label: 'Total Enrollments' },
          { icon: <CheckCircle />,value: publishedCourses,            label: 'Published Courses' },
        ].map((s, i) => (
          <Grid item xs={6} sm={4} md={2} key={i}>
            <StatCard {...s} sub={sub} surface={surface} border={border} txt={txt} />
          </Grid>
        ))}
      </Grid>

      {/* ── Row 1: Category chart (left) + Role pie (right) ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Courses by Category — bar chart */}
        <Grid item xs={12} md={7}>
          <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 3, boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: txt, mb: 2 }}>
                Courses by Category
              </Typography>
              {catData.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <BarChart sx={{ fontSize: 40, color: border, mb: 1 }} />
                  <Typography variant="body2" sx={{ color: sub }}>No course data yet</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <RBarChart data={catData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={border} />
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: sub }} />
                    <YAxis tick={{ fontSize: 11, fill: sub }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: surface, border: `1px solid ${border}`, borderRadius: 8 }}
                      labelStyle={{ color: txt }} itemStyle={{ color: sub }}
                    />
                    <Bar dataKey="count" fill={isDark ? '#6B7280' : '#374151'} radius={[4, 4, 0, 0]} name="Courses" />
                  </RBarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* User Role Distribution — pie chart */}
        <Grid item xs={12} md={5}>
          <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 3, boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: txt, mb: 2 }}>
                User Role Distribution
              </Typography>
              {roleData.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <People sx={{ fontSize: 40, color: border, mb: 1 }} />
                  <Typography variant="body2" sx={{ color: sub }}>No users yet</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: surface, border: `1px solid ${border}`, borderRadius: 8 }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '0.75rem', color: sub }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Row 2: Course Status (left) + Recent Users (right) ── */}
      <Grid container spacing={3}>
        {/* Course status breakdown */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 3, boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: txt, mb: 2 }}>
                Course Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: 'Published', value: publishedCourses, total: totalCourses, color: '#16A34A' },
                  { label: 'Draft',     value: draftCourses,     total: totalCourses, color: '#D97706' },
                ].map(row => (
                  <Box key={row.label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ color: txt }}>{row.label}</Typography>
                      <Typography variant="body2" sx={{ color: sub }}>{row.value} / {row.total}</Typography>
                    </Box>
                    <LinearProgress variant="determinate"
                      value={totalCourses > 0 ? (row.value / totalCourses) * 100 : 0}
                      sx={{ height: 7, borderRadius: 4, bgcolor: border,
                        '& .MuiLinearProgress-bar': { bgcolor: row.color, borderRadius: 4 } }}
                    />
                  </Box>
                ))}
                <Box sx={{ mt: 1, p: 2, bgcolor: hover, borderRadius: 2, border: `1px solid ${border}` }}>
                  <Typography variant="caption" sx={{ color: sub, display: 'block' }}>Enrollment Rate</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: txt }}>
                    {totalCourses > 0 ? Math.round((stats?.totalEnrollments || 0) / totalCourses * 10) / 10 : 0}
                    <Typography component="span" variant="body2" sx={{ color: sub, fontWeight: 400 }}> avg/course</Typography>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Users — fixed height, no overflow */}
        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 3, boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: txt }}>Recent Users</Typography>
                <Button size="small" startIcon={<Refresh sx={{ fontSize: 14 }} />} onClick={load}
                  sx={{ color: sub, fontSize: '0.75rem', textTransform: 'none' }}>Refresh</Button>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['User', 'Role', 'Joined'].map(h => (
                      <TableCell key={h} sx={{ color: sub, fontSize: '0.72rem', fontWeight: 700,
                        borderBottom: `1px solid ${border}`, pb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id} sx={{ '&:hover': { bgcolor: hover }, '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ borderColor: border }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar sx={{ width: 30, height: 30, bgcolor: hover, fontSize: 12,
                            fontWeight: 700, color: txt, border: `1px solid ${border}` }}>
                            {u.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: txt, lineHeight: 1.2 }}>{u.name}</Typography>
                            <Typography variant="caption" sx={{ color: sub }}>{u.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderColor: border }}>
                        <Chip label={u.role} size="small" variant="outlined"
                          sx={{ textTransform: 'capitalize', fontSize: '0.65rem', height: 20,
                            color: u.role === 'admin' ? '#7C3AED' : u.role === 'instructor' ? '#0369A1' : sub,
                            borderColor: u.role === 'admin' ? '#7C3AED' : u.role === 'instructor' ? '#0369A1' : border,
                          }} />
                      </TableCell>
                      <TableCell sx={{ borderColor: border }}>
                        <Typography variant="caption" sx={{ color: sub }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4, color: sub, border: 0 }}>No users yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}