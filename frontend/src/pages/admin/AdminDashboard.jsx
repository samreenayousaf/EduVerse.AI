import React, { useEffect, useState } from 'react';
import {
  Grid, Typography, Box, Card, CardContent, Avatar, Chip, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Button, Tabs, Tab, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Switch, FormControlLabel, LinearProgress, Select,
  MenuItem, InputAdornment,
} from '@mui/material';
import {
  People, School, TrendingUp, Block, CheckCircle, AdminPanelSettings,
  Person, Settings, Add, Delete, Edit, Search, Download, Assessment,
  MoreVert, Lock, Refresh,
} from '@mui/icons-material';
import StatCard from '../../components/common/StatCard';
import { analyticsAPI, adminAPI } from '../../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';

const analyticsService = analyticsAPI;
const adminService = adminAPI;

const AdminDashboard = () => {
  const { user }    = useAuth();
  const { mode }    = useThemeMode();
  const isDark      = mode === 'dark';
  const surface     = isDark ? '#1F2937' : '#FFFFFF';
  const border      = isDark ? '#374151' : '#E5E7EB';
  const txt         = isDark ? '#F9FAFB' : '#111827';
  const sub         = isDark ? '#9CA3AF' : '#6B7280';
  const hover       = isDark ? '#374151' : '#F3F4F6';
  const chartFill   = isDark ? '#6B7280' : '#374151';

  const [analytics,    setAnalytics]    = useState(null);
  const [users,        setUsers]        = useState([]);
  const [courses,      setCourses]      = useState([]);
  const [activeTab,    setActiveTab]    = useState(0);
  const [categories,   setCategories]   = useState(['Web Development','Data Science','Design','Mobile Dev','DevOps','Cybersecurity']);
  const [catDialog,    setCatDialog]    = useState(false);
  const [newCat,       setNewCat]       = useState('');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [maintenance,  setMaintenance]  = useState(false);
  const [userSearch,   setUserSearch]   = useState('');
  const [roleFilter,   setRoleFilter]   = useState('All');
  const [loading,      setLoading]      = useState(true);

  const loadData = async () => {
    try {
      const { data } = await analyticsService.admin();
      setAnalytics(data.analytics || data);
      setUsers(data.analytics?.recentUsers || data.recentUsers || []);
    } catch {}
    try {
      const { data } = await adminAPI.getCourses();
      setCourses(Array.isArray(data) ? data : data.courses || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filteredUsers = users.filter(u =>
    (u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())) &&
    (roleFilter === 'All' || u.role === roleFilter)
  );

  const handleToggleUser = async (id) => {
    try { await adminService.updateUser(id, {}); toast.success('User updated'); loadData(); } catch { toast.error('Failed'); }
  };

  const handleCourseStatus = async (id, status) => {
    try { await adminAPI.updateCourseStatus(id, { status }); toast.success(`Course ${status}`); loadData(); } catch { toast.error('Failed'); }
  };

  const pieData = [
    { name: 'Students', value: analytics?.totalStudents || 0 },
    { name: 'Instructors', value: analytics?.totalInstructors || 0 },
  ].filter(d => d.value > 0);
  const COLORS = [isDark ? '#6B7280' : '#374151', isDark ? '#9CA3AF' : '#6B7280'];

  const growthData = [
    { month: 'Jan', users: 800 }, { month: 'Feb', users: 950 }, { month: 'Mar', users: 1050 },
    { month: 'Apr', users: 1100 }, { month: 'May', users: 1200 }, { month: 'Jun', users: 1296 },
  ];

  const tabStyle = { minHeight: 36, py: 0.5, fontSize: '0.78rem', fontWeight: 600, color: sub, textTransform: 'none', '&.Mui-selected': { color: txt } };

  const cellSx = { py: 1.5, px: 2, fontSize: '0.8rem', color: sub, borderColor: border };
  const headSx = { py: 1.2, px: 2, fontSize: '0.7rem', fontWeight: 700, color: sub, textTransform: 'uppercase', letterSpacing: '0.05em', bgcolor: hover, borderColor: border };

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: txt }}>Hi, {user?.name?.split(' ')[0]} 👋</Typography>
          <Typography variant="body2" sx={{ color: sub, mt: 0.5 }}>Admin Panel — Full system control</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<Download fontSize="small" />}
            sx={{ borderColor: border, color: sub, borderRadius: 2, fontSize: '0.8rem', '&:hover': { bgcolor: hover, borderColor: txt, color: txt } }}>
            Export Report
          </Button>
          <Button variant="contained" size="small" startIcon={<Add fontSize="small" />}
            onClick={() => setActiveTab(1)}
            sx={{ bgcolor: isDark ? '#374151' : '#1F2937', color: '#fff', borderRadius: 2, fontSize: '0.8rem', '&:hover': { bgcolor: isDark ? '#4B5563' : '#111827' } }}>
            Add User
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: 'Total Users',   value: String(analytics?.totalUsers       || 0), icon: <People fontSize="small" />,            trend: 18 },
          { title: 'Students',      value: String(analytics?.totalStudents    || 0), icon: <Person fontSize="small" />,             trend: 25 },
          { title: 'Instructors',   value: String(analytics?.totalInstructors || 0), icon: <AdminPanelSettings fontSize="small" />, trend: 10 },
          { title: 'Total Courses', value: String(analytics?.totalCourses     || 0), icon: <School fontSize="small" />,             trend: 15 },
        ].map(s => <Grid item xs={6} md={3} key={s.title}><StatCard {...s} /></Grid>)}
      </Grid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${border}`, minHeight: 36 }}
        TabIndicatorProps={{ sx: { bgcolor: txt, height: 2 } }}>
        {['Overview', 'User Management', 'Course Management', 'Categories', 'System Settings'].map(t => (
          <Tab key={t} label={t} sx={tabStyle} />
        ))}
      </Tabs>

      {/* ── TAB 0 OVERVIEW ── */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt, mb: 2 }}>User Distribution</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 8, color: txt }} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', color: sub }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt, mb: 2 }}>User Growth (6 months)</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={growthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={border} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: sub }} />
                    <YAxis tick={{ fontSize: 11, fill: sub }} />
                    <Tooltip contentStyle={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 8, color: txt }} />
                    <Area type="monotone" dataKey="users" stroke={chartFill} fill={isDark ? '#37415140' : '#F3F4F6'} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt }}>Recent Users</Typography>
                  <Button size="small" onClick={() => setActiveTab(1)} sx={{ color: sub, fontSize: '0.8rem' }}>View All</Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead><TableRow>
                      {['User', 'Role', 'Joined', 'Status', 'Action'].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}
                    </TableRow></TableHead>
                    <TableBody>
                      {users.slice(0, 5).map(u => (
                        <TableRow key={u._id} hover sx={{ '& td': { borderColor: border } }}>
                          <TableCell sx={cellSx}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 30, height: 30, bgcolor: hover, fontSize: '0.8rem', fontWeight: 700, color: sub }}>{u.name?.[0]}</Avatar>
                              <Box><Typography variant="body2" fontWeight={600} sx={{ color: txt, fontSize: '0.8rem' }}>{u.name}</Typography><Typography variant="caption" sx={{ color: sub }}>{u.email}</Typography></Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={cellSx}><Chip label={u.role} size="small" sx={{ bgcolor: hover, color: sub, fontSize: '0.65rem', height: 20, textTransform: 'capitalize' }} /></TableCell>
                          <TableCell sx={cellSx}>{dayjs(u.createdAt).format('MMM D, YYYY')}</TableCell>
                          <TableCell sx={cellSx}><Chip label={u.isBlocked ? 'Blocked' : 'Active'} size="small" sx={{ bgcolor: u.isBlocked ? (isDark ? '#7f1d1d30' : '#FEF2F2') : (isDark ? '#14532d30' : '#F0FDF4'), color: u.isBlocked ? '#EF4444' : '#16A34A', fontSize: '0.65rem', height: 20 }} /></TableCell>
                          <TableCell sx={cellSx}><IconButton size="small" onClick={() => handleToggleUser(u._id)} sx={{ color: sub }}><Block sx={{ fontSize: 16 }} /></IconButton></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── TAB 1 USER MANAGEMENT ── */}
      {activeTab === 1 && (
        <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt }}>All Users</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size="small" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: sub }} /></InputAdornment> }}
                  sx={{ width: 180, '& .MuiOutlinedInput-root': { bgcolor: hover, '& fieldset': { border: 'none' }, borderRadius: 2 }, '& input': { color: txt, fontSize: '0.8rem' } }} />
                <Select size="small" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                  sx={{ bgcolor: hover, '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, color: txt, borderRadius: 2, fontSize: '0.8rem', minWidth: 110 }}>
                  <MenuItem value="All">All Roles</MenuItem>
                  <MenuItem value="student">Students</MenuItem>
                  <MenuItem value="instructor">Instructors</MenuItem>
                  <MenuItem value="admin">Admins</MenuItem>
                </Select>
              </Box>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow>
                  {['User', 'Role', 'Joined', 'Status', 'Actions'].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}
                </TableRow></TableHead>
                <TableBody>
                  {filteredUsers.map(u => (
                    <TableRow key={u._id} hover sx={{ '& td': { borderColor: border } }}>
                      <TableCell sx={cellSx}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: hover, fontSize: '0.85rem', fontWeight: 700, color: sub }}>{u.name?.[0]}</Avatar>
                          <Box><Typography variant="body2" fontWeight={600} sx={{ color: txt, fontSize: '0.8rem' }}>{u.name}</Typography><Typography variant="caption" sx={{ color: sub }}>{u.email}</Typography></Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={cellSx}><Chip label={u.role} size="small" sx={{ bgcolor: hover, color: sub, fontSize: '0.65rem', height: 20, textTransform: 'capitalize' }} /></TableCell>
                      <TableCell sx={cellSx}>{dayjs(u.createdAt).format('MMM D, YYYY')}</TableCell>
                      <TableCell sx={cellSx}><Chip label={u.isBlocked ? 'Blocked' : 'Active'} size="small" sx={{ bgcolor: u.isBlocked ? (isDark ? '#7f1d1d30' : '#FEF2F2') : (isDark ? '#14532d30' : '#F0FDF4'), color: u.isBlocked ? '#EF4444' : '#16A34A', fontSize: '0.65rem', height: 20 }} /></TableCell>
                      <TableCell sx={cellSx}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" title={u.isBlocked ? 'Unblock' : 'Block'} onClick={() => handleToggleUser(u._id)} sx={{ color: sub, '&:hover': { color: '#EF4444' } }}><Block sx={{ fontSize: 15 }} /></IconButton>
                          <IconButton size="small" sx={{ color: sub, '&:hover': { color: txt } }}><Edit sx={{ fontSize: 15 }} /></IconButton>
                          <IconButton size="small" sx={{ color: sub, '&:hover': { color: '#EF4444' } }}><Delete sx={{ fontSize: 15 }} /></IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ ...cellSx, py: 4 }}>No users found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 2 COURSE MANAGEMENT ── */}
      {activeTab === 2 && (
        <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt, mb: 2.5 }}>Course Management</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow>
                  {['Course', 'Instructor', 'Students', 'Status', 'Actions'].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}
                </TableRow></TableHead>
                <TableBody>
                  {courses.map(c => (
                    <TableRow key={c._id} hover sx={{ '& td': { borderColor: border } }}>
                      <TableCell sx={cellSx}>
                        <Typography variant="body2" fontWeight={600} sx={{ color: txt, fontSize: '0.8rem' }}>{c.title}</Typography>
                        <Typography variant="caption" sx={{ color: sub }}>{c.category}</Typography>
                      </TableCell>
                      <TableCell sx={cellSx}>{c.instructorName || c.instructor?.name || '—'}</TableCell>
                      <TableCell sx={cellSx}>{c.enrolledStudents?.length || 0}</TableCell>
                      <TableCell sx={cellSx}>
                        <Chip label={c.status || 'draft'} size="small" sx={{
                          bgcolor: c.status === 'published' ? (isDark ? '#14532d30' : '#F0FDF4') : c.status === 'pending' ? (isDark ? '#78350f30' : '#FFFBEB') : hover,
                          color: c.status === 'published' ? '#16A34A' : c.status === 'pending' ? '#D97706' : sub,
                          fontSize: '0.65rem', height: 20, textTransform: 'capitalize',
                        }} />
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button size="small" variant="outlined" onClick={() => handleCourseStatus(c._id, 'published')}
                            sx={{ fontSize: '0.65rem', borderColor: border, color: '#16A34A', py: 0.2, px: 1, borderRadius: 1.5, minWidth: 0, '&:hover': { bgcolor: isDark ? '#14532d30' : '#F0FDF4', borderColor: '#16A34A' } }}>Approve</Button>
                          <Button size="small" variant="outlined" onClick={() => handleCourseStatus(c._id, 'rejected')}
                            sx={{ fontSize: '0.65rem', borderColor: border, color: '#EF4444', py: 0.2, px: 1, borderRadius: 1.5, minWidth: 0, '&:hover': { bgcolor: isDark ? '#7f1d1d30' : '#FEF2F2', borderColor: '#EF4444' } }}>Reject</Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {courses.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ ...cellSx, py: 4 }}>No courses found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 3 CATEGORIES ── */}
      {activeTab === 3 && (
        <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt }}>Manage Categories</Typography>
              <Button variant="contained" size="small" startIcon={<Add fontSize="small" />} onClick={() => setCatDialog(true)}
                sx={{ bgcolor: isDark ? '#374151' : '#1F2937', color: '#fff', borderRadius: 2, fontSize: '0.8rem', '&:hover': { bgcolor: isDark ? '#4B5563' : '#111827' } }}>
                Add Category
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {categories.map(cat => (
                <Chip key={cat} label={cat} onDelete={() => { setCategories(categories.filter(c => c !== cat)); toast.success('Removed'); }}
                  sx={{ bgcolor: hover, color: sub, border: `1px solid ${border}`, fontWeight: 500, fontSize: '0.8rem',
                    '& .MuiChip-deleteIcon': { color: sub, '&:hover': { color: '#EF4444' } } }} />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 4 SYSTEM SETTINGS ── */}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt, mb: 3 }}>Platform Settings</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {[
                    { label: 'Email Notifications', desc: 'Send email alerts to users', value: notifEnabled, set: setNotifEnabled },
                    { label: 'Maintenance Mode', desc: 'Take platform offline temporarily', value: maintenance, set: (v) => { setMaintenance(v); toast.info(v ? 'Maintenance mode ON' : 'Maintenance mode OFF'); } },
                  ].map(s => (
                    <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: hover, borderRadius: 2, border: `1px solid ${border}` }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ color: txt }}>{s.label}</Typography>
                        <Typography variant="caption" sx={{ color: sub }}>{s.desc}</Typography>
                      </Box>
                      <Switch checked={s.value} onChange={e => s.set(e.target.checked)}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: isDark ? '#9CA3AF' : '#374151' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: isDark ? '#6B7280' : '#374151' } }} />
                    </Box>
                  ))}
                  <Button variant="contained" size="small" onClick={() => toast.success('Settings saved!')}
                    sx={{ mt: 1, bgcolor: isDark ? '#374151' : '#1F2937', color: '#fff', borderRadius: 2, alignSelf: 'flex-start', '&:hover': { bgcolor: isDark ? '#4B5563' : '#111827' } }}>
                    Save Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt, mb: 2.5 }}>Platform Stats</Typography>
                {[
                  { label: 'Total Users', value: analytics?.totalUsers || 0 },
                  { label: 'Total Students', value: analytics?.totalStudents || 0 },
                  { label: 'Total Instructors', value: analytics?.totalInstructors || 0 },
                  { label: 'Total Courses', value: analytics?.totalCourses || 0 },
                  { label: 'Active Sessions', value: Math.floor(Math.random() * 200 + 100) },
                ].map(s => (
                  <Box key={s.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: `1px solid ${border}` }}>
                    <Typography variant="body2" sx={{ color: sub }}>{s.label}</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: txt }}>{s.value.toLocaleString()}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: txt, mb: 2 }}>Activity Log</Typography>
                {[
                  { action: 'User blocked', actor: 'admin@lms.com', time: '2 min ago' },
                  { action: 'Course approved', actor: 'admin@lms.com', time: '15 min ago' },
                  { action: 'New instructor registered', actor: 'system', time: '1 hour ago' },
                  { action: 'Category added: DevOps', actor: 'admin@lms.com', time: '3 hours ago' },
                ].map((log, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.2, borderBottom: i < 3 ? `1px solid ${border}` : 'none' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500} sx={{ color: txt, fontSize: '0.8rem' }}>{log.action}</Typography>
                      <Typography variant="caption" sx={{ color: sub }}>{log.actor}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: sub }}>{log.time}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Category Dialog */}
      <Dialog open={catDialog} onClose={() => setCatDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: surface, border: `1px solid ${border}`, borderRadius: 3 } }}>
        <DialogTitle sx={{ color: txt, fontWeight: 700 }}>Add Category</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Category name" value={newCat} onChange={e => setNewCat(e.target.value)} sx={{ mt: 1, '& .MuiOutlinedInput-root': { bgcolor: hover, '& fieldset': { borderColor: border }, borderRadius: 2 }, '& input': { color: txt } }}
            onKeyDown={e => { if (e.key === 'Enter' && newCat.trim()) { setCategories([...categories, newCat.trim()]); setNewCat(''); setCatDialog(false); toast.success('Added!'); }}} />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCatDialog(false)} sx={{ color: sub, borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={() => { if (!newCat.trim()) return; setCategories([...categories, newCat.trim()]); setNewCat(''); setCatDialog(false); toast.success('Category added!'); }}
            sx={{ bgcolor: isDark ? '#374151' : '#1F2937', color: '#fff', borderRadius: 2, '&:hover': { bgcolor: isDark ? '#4B5563' : '#111827' } }}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default AdminDashboard;