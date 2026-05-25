import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, Button,
  LinearProgress, Avatar, Chip, CircularProgress, Paper,
  List, ListItem, ListItemAvatar, ListItemText, Divider,
} from '@mui/material';
import {
  School, Assignment, EmojiEvents, TrendingUp, SmartToy,
  ArrowForward, CheckCircle, Schedule,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend,
} from 'recharts';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { enrollmentService, aiService } from '../../services/api';
import Navbar from '../../components/common/Navbar';

const StatCard = ({ icon, label, value, color, subtitle }) => (
  <Card sx={{
    background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
    color: '#fff', border: 'none',
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ p: 1.2, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }}>
          {React.cloneElement(icon, { sx: { fontSize: 22 } })}
        </Box>
        {subtitle && <Typography variant="caption" sx={{ opacity: 0.8 }}>{subtitle}</Typography>}
      </Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.25 }}>{value}</Typography>
      <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>{label}</Typography>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [enrollRes, insightRes] = await Promise.all([
          enrollmentService.getMyEnrollments(),
          aiService.getInsights(),
        ]);
        setEnrollments(enrollRes.data.data || []);
        setInsights(insightRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const completedCourses = enrollments.filter((e) => e.isCompleted).length;
  const activeCourses = enrollments.filter((e) => !e.isCompleted).length;
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
    : 0;

  const progressData = enrollments.slice(0, 6).map((e) => ({
    name: e.course?.title?.slice(0, 15) + '...' || 'Course',
    progress: e.progress,
  }));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={user?.avatar} sx={{
              width: 52, height: 52, fontSize: '1.25rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #0F4C81, #00B4D8)',
            }}>
              {user?.name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </Typography>
              <Typography color="text.secondary">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Stat Cards */}
            <Grid item xs={6} md={3}>
              <StatCard icon={<School />} label="Enrolled Courses" value={enrollments.length} color="#0F4C81" />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<CheckCircle />} label="Completed" value={completedCourses} color="#06D6A0" />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<Schedule />} label="In Progress" value={activeCourses} color="#00B4D8" />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<TrendingUp />} label="Avg. Progress" value={`${avgProgress}%`} color="#7B2D8B" />
            </Grid>

            {/* Progress Chart */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>Course Progress Overview</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={progressData}>
                      <defs>
                        <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha('#0F4C81', 0.08)} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Progress']} />
                      <Area type="monotone" dataKey="progress" stroke="#0F4C81" strokeWidth={2.5}
                        fill="url(#progressGrad)" dot={{ r: 4, fill: '#0F4C81' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* AI Insights */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #0F4C81 0%, #00B4D8 100%)', border: 'none' }}>
                <CardContent sx={{ p: 3, color: '#fff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }}>
                      <SmartToy />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>AI Insights</Typography>
                  </Box>
                  {insights ? (
                    <>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, lineHeight: 1.6 }}>
                        {insights.insights?.summary || 'Keep up the great work on your learning journey!'}
                      </Typography>
                      {insights.insights?.recommendations?.slice(0, 2).map((rec, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00E5FF', flexShrink: 0, mt: 0.8 }} />
                          <Typography variant="caption" sx={{ opacity: 0.85 }}>{rec}</Typography>
                        </Box>
                      ))}
                      <Typography variant="caption" sx={{ display: 'block', mt: 2, p: 1.5,
                        background: 'rgba(255,255,255,0.15)', borderRadius: 2, fontStyle: 'italic' }}>
                        💡 {insights.insights?.motivationTip}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Enroll in courses to get personalized AI insights!
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Active Courses */}
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={700}>Active Courses</Typography>
                    <Button component={Link} to="/courses" endIcon={<ArrowForward />} size="small">Browse All</Button>
                  </Box>
                  {enrollments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <School sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">No courses yet. Start learning today!</Typography>
                      <Button component={Link} to="/courses" variant="contained" sx={{ mt: 2 }}>Explore Courses</Button>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {enrollments.filter((e) => !e.isCompleted).slice(0, 4).map((enrollment) => (
                        <Grid item xs={12} sm={6} md={3} key={enrollment._id}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3,
                            '&:hover': { borderColor: 'primary.main', boxShadow: 3 }, transition: 'all 0.2s' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                              <Avatar sx={{ width: 38, height: 38, borderRadius: 2,
                                background: 'linear-gradient(135deg, #0F4C81, #00B4D8)', fontSize: '0.875rem' }}>
                                {enrollment.course?.title?.[0]}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={700} noWrap>
                                  {enrollment.course?.title}
                                </Typography>
                                <Chip label={enrollment.course?.category} size="small"
                                  sx={{ fontSize: '0.65rem', height: 18 }} />
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">Progress</Typography>
                              <Typography variant="caption" fontWeight={700} color="primary.main">
                                {enrollment.progress}%
                              </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={enrollment.progress} sx={{ mb: 1.5 }} />
                            <Button
                              component={Link}
                              to={`/courses/${enrollment.course?._id}/learn`}
                              variant="outlined"
                              size="small"
                              fullWidth
                              sx={{ borderRadius: 2 }}
                            >
                              Continue
                            </Button>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default DashboardPage;
