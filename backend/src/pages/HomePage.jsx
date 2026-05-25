import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Avatar, Chip, Container } from '@mui/material';
import { School, AutoAwesome, TrendingUp, People, ArrowForward, PlayArrow, CheckCircle } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const features = [
  { icon: <AutoAwesome />, title: 'AI-Powered Learning', desc: 'Personalized recommendations and adaptive learning paths based on your progress', color: '#7C3AED', bg: '#F5F3FF' },
  { icon: <TrendingUp />, title: 'Progress Tracking', desc: 'Real-time analytics and insights to monitor your learning journey', color: '#2563EB', bg: '#EFF6FF' },
  { icon: <People />, title: 'Expert Instructors', desc: 'Learn from industry professionals with years of real-world experience', color: '#10B981', bg: '#ECFDF5' },
  { icon: <School />, title: 'Certification', desc: 'Earn recognized certificates to boost your career opportunities', color: '#F59E0B', bg: '#FFFBEB' },
];

const stats = [
  { value: '50K+', label: 'Active Students' },
  { value: '1,200+', label: 'Expert Courses' },
  { value: '300+', label: 'Instructors' },
  { value: '95%', label: 'Satisfaction Rate' },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      {/* Hero Section */}
      <Box sx={{ background: 'linear-gradient(135deg, #0F172A 0%, #1e3a8a 50%, #4c1d95 100%)', color: 'white', py: { xs: 8, md: 14 }, px: 3, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.3), transparent 70%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="🤖 AI-Powered Learning Platform" sx={{ bgcolor: 'rgba(124,58,237,0.2)', color: 'white', border: '1px solid rgba(124,58,237,0.4)', fontWeight: 600, mb: 3 }} />
              <Typography variant="h2" fontWeight={900} lineHeight={1.15} gutterBottom sx={{ fontSize: { xs: '2.2rem', md: '3rem' } }}>
                Learn Smarter with{' '}
                <Box component="span" sx={{ background: 'linear-gradient(135deg, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  EduVerse.AI
                </Box>
              </Typography>
              <Typography sx={{ opacity: 0.8, fontSize: '1.1rem', lineHeight: 1.7, mb: 4, maxWidth: 480 }}>
                Experience the future of education with AI-driven personalization, expert-led courses, and intelligent progress tracking.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" endIcon={<ArrowForward />} onClick={() => navigate('/register')}
                  sx={{ bgcolor: 'white', color: '#1D4ED8', fontWeight: 800, px: 4, py: 1.5, '&:hover': { bgcolor: '#F8FAFC', transform: 'translateY(-2px)' }, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                  Start Learning Free
                </Button>
                <Button variant="outlined" size="large" startIcon={<PlayArrow />} onClick={() => navigate('/courses')}
                  sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', px: 4, py: 1.5, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  Browse Courses
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 3, mt: 5, flexWrap: 'wrap' }}>
                {[{ icon: <CheckCircle sx={{ fontSize: 16 }} />, text: 'No credit card required' }, { icon: <CheckCircle sx={{ fontSize: 16 }} />, text: 'Free forever plan' }, { icon: <CheckCircle sx={{ fontSize: 16 }} />, text: 'Cancel anytime' }].map((item) => (
                  <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.75 }}>
                    <Box sx={{ color: '#34D399' }}>{item.icon}</Box>
                    <Typography variant="body2">{item.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <Box sx={{ width: 420, height: 360, background: 'rgba(255,255,255,0.05)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[{ course: 'React.js Complete Guide', progress: 85, color: '#60A5FA' }, { course: 'Node.js & Express API', progress: 60, color: '#A78BFA' }, { course: 'MongoDB Database Design', progress: 40, color: '#34D399' }].map((item) => (
                  <Box key={item.course} sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{item.course}</Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ color: item.color }}>{item.progress}%</Typography>
                    </Box>
                    <Box sx={{ height: 6, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 10 }}>
                      <Box sx={{ height: '100%', width: `${item.progress}%`, bgcolor: item.color, borderRadius: 10, transition: 'width 1s ease' }} />
                    </Box>
                  </Box>
                ))}
                <Box sx={{ p: 2, bgcolor: 'rgba(124,58,237,0.2)', borderRadius: 3, border: '1px solid rgba(124,58,237,0.3)', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#7C3AED', width: 36, height: 36 }}><AutoAwesome sx={{ fontSize: 18 }} /></Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>AI Recommendation</Typography>
                    <Typography variant="body2" fontWeight={600}>Try "Advanced TypeScript" next!</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats */}
      <Box sx={{ bgcolor: 'white', py: 4, borderBottom: '1px solid #E2E8F0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((s) => (
              <Grid item xs={6} sm={3} key={s.label} sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={900} sx={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</Typography>
                <Typography color="text.secondary" fontWeight={500}>{s.label}</Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Chip label="Why EduVerse.AI?" color="primary" sx={{ mb: 2, fontWeight: 600 }} />
          <Typography variant="h3" fontWeight={800} gutterBottom>Everything You Need to Succeed</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', fontSize: '1.05rem' }}>A complete learning ecosystem designed for modern education</Typography>
        </Box>
        <Grid container spacing={3}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Avatar sx={{ bgcolor: f.bg, color: f.color, width: 60, height: 60, mx: 'auto', mb: 2.5, borderRadius: 3 }}>{f.icon}</Avatar>
                  <Typography variant="h6" fontWeight={700} gutterBottom>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>{f.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA */}
      <Box sx={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', py: 10, px: 3, textAlign: 'center', color: 'white' }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>Ready to Transform Your Learning?</Typography>
        <Typography sx={{ opacity: 0.85, mb: 5, fontSize: '1.1rem' }}>Join 50,000+ learners already using EduVerse.AI</Typography>
        <Button variant="contained" size="large" endIcon={<ArrowForward />} onClick={() => navigate('/register')}
          sx={{ bgcolor: 'white', color: '#2563EB', fontWeight: 800, px: 5, py: 1.8, fontSize: '1.05rem', '&:hover': { bgcolor: '#F8FAFC', transform: 'translateY(-2px)' }, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          Get Started for Free
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#0F172A', color: 'rgba(255,255,255,0.5)', py: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <School sx={{ color: '#60A5FA' }} />
          <Typography fontWeight={800} color="white">EduVerse.AI</Typography>
        </Box>
        <Typography variant="body2">© 2025 EduVerse.AI — AI-Powered Learning Management System</Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
