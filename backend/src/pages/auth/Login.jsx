import React, { useState } from 'react';
import {
  Box, Card, TextField, Button, Typography, InputAdornment,
  IconButton, Alert, CircularProgress, Divider,
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, School } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form,     setForm]    = useState({ email: '', password: '' });
  const [showPwd,  setShowPwd] = useState(false);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      navigate(`/${user.role}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f4f6fb',
      p: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 4.5 }, borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>

        {/* Logo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: 3,
            bgcolor: '#1a237e',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5,
          }}>
            <School sx={{ fontSize: 28, color: '#fff' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">EduVerse.AI</Typography>
         
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Email Address"
            type="email"
            required
            fullWidth
            autoComplete="email"
            autoFocus
            value={form.email}
            onChange={e => set('email', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Password"
            required
            fullWidth
            autoComplete="current-password"
            type={showPwd ? 'text' : 'password'}
            value={form.password}
            onChange={e => set('password', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" edge="end" onClick={() => setShowPwd(p => !p)} tabIndex={-1}>
                    {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.5, fontWeight: 700, fontSize: '1rem',
              borderRadius: 2.5, bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#283593' },
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'right', mt: 2, mb: 1 }}>
          <Link to="/forgot-password" style={{ color: '#1a237e', fontWeight: 600, textDecoration: 'none', fontSize: '0.82rem' }}>
            Forgot password?
          </Link>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Typography variant="body2" textAlign="center" color="text.secondary">
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#1a237e', fontWeight: 700, textDecoration: 'none' }}>
            Create one here
          </Link>
        </Typography>
      </Card>
    </Box>
  );
}