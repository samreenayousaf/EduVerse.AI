// LandingPage.jsx
import React from 'react';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  Avatar, Chip,
} from '@mui/material';
import {
  AutoStories, SmartToy, EmojiEvents, School, ArrowForward,
  PlayCircle, People, TrendingUp,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Navbar from '../components/common/Navbar';

const FEATURES = [
  { icon: <SmartToy />, title: 'AI-Powered Learning', desc: 'Personalized recommendations and insights driven by AI to accelerate your growth.', color: '#0F4C81' },
  { icon: <School />, title: 'Expert Instructors', desc: 'Learn from industry professionals with real-world experience and knowledge.', color: '#7B2D8B' },
  { icon: <EmojiEvents />, title: 'Certifications', desc: 'Earn recognized certificates upon course completion to boost your career.', color: '#00B4D8' },
  { icon: <TrendingUp />, title: 'Progress Tracking', desc: 'Monitor your learning journey with detailed analytics and progress dashboards.', color: '#06D6A0' },
];

const STATS = [
  { value: '50,000+', label: 'Students Enrolled' },
  { value: '1,200+', label: 'Courses Available' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '200+', label: 'Expert Instructors' },
];

const LandingPage = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
    <Navbar />

    {/* Hero */}
    <Box sx={{
      background: 'linear-gradient(135deg, #0F4C81 0%, #0096C7 60%, #00B4D8 100%)',
      py: { xs: 10, md: 16 }, position: 'relative', overflow: 'hidden',
    }}>
      <Box sx={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      <Box sx={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <Container maxWidth="lg" sx={{ position: 'relative', textAlign: 'center' }}>
        <Chip
          label="🚀 AI-Powered Education Platform"
          sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, backdropFilter: 'blur(10px)' }}
        />
        <Typography variant="h1" fontWeight={800} sx={{
          color: '#fff', mb: 3, fontSize: { xs: '2.5rem', md: '4rem' },
          lineHeight: 1.1, letterSpacing: '-0.03em',
        }}>
          Learn Smarter with{' '}
          <Box component="span" sx={{ color: '#00E5FF' }}>AI-Driven</Box>
          <br />Education
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', mb: 5, maxWidth: 600, mx: 'auto', lineHeight: 1.7 }}>
          Access world-class courses, track your progress, and get personalized AI insights to master any skill faster.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button component={Link} to="/register" variant="contained" size="large"
            endIcon={<ArrowForward />}
            sx={{ bgcolor: '#fff', color: 'primary.main', fontSize: '1rem', px: 4, py: 1.5, fontWeight: 700,
              '&:hover': { bgcolor: '#f0f4f8', transform: 'translateY(-2px)' } }}>
            Start Learning Free
          </Button>
          <Button component={Link} to="/courses" variant="outlined" size="large"
            startIcon={<PlayCircle />}
            sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', fontSize: '1rem', px: 4, py: 1.5,
              '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
            Browse Courses
          </Button>
        </Box>
      </Container>
    </Box>

    {/* Stats */}
    <Box sx={{ bgcolor: '#fff', py: 5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          {STATS.map((stat) => (
            <Grid item xs={6} md={3} key={stat.label} sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={800} color="primary.main">{stat.value}</Typography>
              <Typography color="text.secondary" fontWeight={500}>{stat.label}</Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>

    {/* Features */}
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ mb: 1 }}>
        Why Choose EduVerse.AI?
      </Typography>
      <Typography color="text.secondary" textAlign="center" sx={{ mb: 6, fontSize: '1.1rem' }}>
        Everything you need to learn, grow, and succeed
      </Typography>
      <Grid container spacing={3}>
        {FEATURES.map((feat) => (
          <Grid item xs={12} sm={6} md={3} key={feat.title}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 1, '&:hover': { transform: 'translateY(-4px)' }, transition: 'all 0.3s' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: 3, mx: 'auto', mb: 2.5,
                  background: alpha(feat.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.cloneElement(feat.icon, { sx: { fontSize: 28, color: feat.color } })}
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>{feat.title}</Typography>
                <Typography color="text.secondary" variant="body2" sx={{ lineHeight: 1.7 }}>{feat.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>

    {/* CTA */}
    <Box sx={{ background: 'linear-gradient(135deg, #0F4C81, #00B4D8)', py: 10 }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <AutoStories sx={{ fontSize: 56, color: 'rgba(255,255,255,0.9)', mb: 2 }} />
        <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', mb: 2 }}>
          Ready to Start Learning?
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.85)', mb: 4, fontSize: '1.1rem' }}>
          Join thousands of learners already transforming their skills with EduVerse.AI
        </Typography>
        <Button component={Link} to="/register" variant="contained" size="large"
          sx={{ bgcolor: '#fff', color: 'primary.main', fontSize: '1.1rem', px: 5, py: 1.8, fontWeight: 800 }}>
          Get Started — It's Free
        </Button>
      </Container>
    </Box>

    {/* Footer */}
    <Box sx={{ bgcolor: '#0D1B2A', py: 4, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1.5 }}>
        <AutoStories sx={{ color: '#00B4D8', fontSize: 22 }} />
        <Typography fontWeight={800} sx={{ color: '#fff', fontSize: '1.1rem' }}>EduVerse.AI</Typography>
      </Box>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
        © {new Date().getFullYear()} EduVerse.AI. All rights reserved.
      </Typography>
    </Box>
  </Box>
);

export default LandingPage;
