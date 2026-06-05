import React, { useState } from 'react';
import {
  Box, Container, TextField, Button, Typography, Link as MuiLink,
  InputAdornment, IconButton, Alert, Paper, Divider, Chip,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, AutoStories } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { alpha } from '@mui/material/styles';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      enqueueSnackbar('Welcome back! 🎉', { variant: 'success' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #0F4C81 0%, #0096C7 50%, #00B4D8 100%)',
    }}>
      {/* Left Panel */}
      <Box sx={{
        flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
        justifyContent: 'center', p: 8,
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
          <AutoStories sx={{ color: '#fff', fontSize: 36 }} />
          <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>EduVerse.AI</Typography>
        </Box>

        <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', mb: 2, lineHeight: 1.2 }}>
          Continue Your Learning Journey
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', mb: 4, lineHeight: 1.6 }}>
          Access your courses, track progress, and unlock AI-powered learning insights.
        </Typography>

        {['Personalized AI insights', 'Interactive quizzes & assignments', 'Progress tracking dashboard'].map((feat) => (
          <Box key={feat} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#00E5FF', flexShrink: 0 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{feat}</Typography>
          </Box>
        ))}
      </Box>

      {/* Right Panel */}
      <Box sx={{
        width: { xs: '100%', md: 480 },
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        p: { xs: 2, md: 4 },
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
      }}>
        <Paper elevation={0} sx={{
          width: '100%', maxWidth: 420, p: { xs: 3, md: 4 },
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.97)',
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2, display: { md: 'none' } }}>
              <AutoStories sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h6" fontWeight={800} color="primary.main">EduVerse.AI</Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ mb: 0.5 }}>Welcome Back</Typography>
            <Typography color="text.secondary" variant="body2">Sign in to continue learning</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth label="Email Address" name="email" type="email"
              value={form.email} onChange={handleChange} required
              InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }}
            />
            <TextField
              fullWidth label="Password" name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password} onChange={handleChange} required
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
              sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700, mt: 0.5 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}><Typography variant="caption" color="text.secondary">Demo Accounts</Typography></Divider>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[
              { label: 'Admin', email: 'admin@eduverse.ai', color: 'error' },
              { label: 'Instructor', email: 'instructor@eduverse.ai', color: 'secondary' },
              { label: 'Student', email: 'student@eduverse.ai', color: 'primary' },
            ].map((demo) => (
              <Chip
                key={demo.label}
                label={demo.label}
                size="small"
                color={demo.color}
                variant="outlined"
                clickable
                onClick={() => setForm({ email: demo.email, password: 'password123' })}
              />
            ))}
          </Box>

          <Typography variant="body2" textAlign="center" sx={{ mt: 3 }} color="text.secondary">
            Don't have an account?{' '}
            <MuiLink component={Link} to="/register" fontWeight={600} color="primary.main" underline="hover">
              Sign up free
            </MuiLink>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;
