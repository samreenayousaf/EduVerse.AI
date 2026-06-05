import React, { useState } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Link as MuiLink,
  InputAdornment, IconButton, Alert, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, AutoStories, School, MenuBook } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      enqueueSnackbar('Account created successfully! 🎉', { variant: 'success' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F4C81 0%, #00B4D8 100%)', p: 2,
    }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 460, p: { xs: 3, md: 5 }, borderRadius: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <AutoStories sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" fontWeight={800} color="primary.main">EduVerse.AI</Typography>
          </Box>
          <Typography variant="h4" fontWeight={800}>Create Account</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>Start your learning journey today</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {/* Role Selector */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>I want to join as</Typography>
          <ToggleButtonGroup
            value={form.role}
            exclusive
            onChange={(e, val) => val && setForm((prev) => ({ ...prev, role: val }))}
            fullWidth
            sx={{ '& .MuiToggleButton-root': { borderRadius: 2, fontWeight: 600, py: 1 } }}
          >
            <ToggleButton value="student">
              <MenuBook sx={{ mr: 1, fontSize: 18 }} /> Student
            </ToggleButton>
            <ToggleButton value="instructor">
              <School sx={{ mr: 1, fontSize: 18 }} /> Instructor
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} required
            InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }}
          />
          <TextField
            fullWidth label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required
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
          <TextField
            fullWidth label="Confirm Password" name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={form.confirmPassword} onChange={handleChange} required
            InputProps={{ startAdornment: <InputAdornment position="start"><Lock fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }}
          />

          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
            sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700, mt: 0.5 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </Box>

        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }} color="text.secondary">
          Already have an account?{' '}
          <MuiLink component={Link} to="/login" fontWeight={600} color="primary.main" underline="hover">
            Sign in
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
