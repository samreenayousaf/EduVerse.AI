import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, Card, CardContent, Button, Chip, Stack, Avatar, LinearProgress, IconButton } from '@mui/material';
import { Add, People, MenuBook, Assignment, TrendingUp, Edit, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { courseService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService.getAll({ instructor: user?.id }).then(({ data }) => {
      setCourses(data.courses || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const enrollmentData = courses.slice(0, 5).map(c => ({ name: c.title?.slice(0, 15) + '...', students: c.enrolledStudents?.length || 0 }));
  const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0);

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>Instructor Dashboard</Typography>
          <Typography color="text.secondary">Manage your courses and track student performance</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/instructor/courses/create')}
          sx={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', fontWeight: 700, px: 3 }}>
          Create Course
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        {[
          { title: 'Total Courses', value: courses.length, icon: <MenuBook />, color: '#2563EB', bgColor: '#EFF6FF', trend: 8 },
          { title: 'Total Students', value: totalStudents, icon: <People />, color: '#10B981', bgColor: '#ECFDF5', trend: 22 },
          { title: 'Published', value: courses.filter(c => c.isPublished).length, icon: <Visibility />, color: '#7C3AED', bgColor: '#F5F3FF', trend: 5 },
          { title: 'Assignments', value: 12, icon: <Assignment />, color: '#F59E0B', bgColor: '#FFFBEB', trend: 10 },
        ].map((s) => <Grid item xs={12} sm={6} lg={3} key={s.title}><StatCard {...s} /></Grid>)}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Enrollment by Course</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={enrollmentData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                    {enrollmentData.map((_, i) => <Cell key={i} fill={['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'][i % 5]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>My Courses</Typography>
                <Button size="small" onClick={() => navigate('/instructor/courses')}>View All</Button>
              </Box>
              <Stack spacing={2}>
                {courses.slice(0, 4).map((course) => (
                  <Box key={course._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <Avatar src={course.thumbnail} variant="rounded" sx={{ width: 44, height: 44, bgcolor: 'primary.main', borderRadius: 2 }}>
                      <MenuBook />
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={600} noWrap>{course.title}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.3 }}>
                        <Typography variant="caption" color="text.secondary">{course.enrolledStudents?.length || 0} students</Typography>
                        <Chip label={course.isPublished ? 'Live' : 'Draft'} size="small" color={course.isPublished ? 'success' : 'default'}
                          sx={{ height: 16, fontSize: '0.6rem' }} />
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={() => navigate(`/instructor/courses/${course._id}/edit`)}><Edit fontSize="small" /></IconButton>
                  </Box>
                ))}
                {courses.length === 0 && !loading && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary" mb={2}>No courses yet</Typography>
                    <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => navigate('/instructor/courses/create')}>Create First Course</Button>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default InstructorDashboard;
