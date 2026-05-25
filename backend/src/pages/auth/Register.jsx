import React, { useState } from 'react';
import {
  Box, Card, TextField, Button, Typography,
  InputAdornment, Alert, CircularProgress, Divider,
} from '@mui/material';
import { Person, Email, Lock, School, Visibility, VisibilityOff } from '@mui/icons-material';
import MuiIconButton from '@mui/material/IconButton';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.name.trim())           return setError('Full name is required.');
    if (form.password.length < 6)    return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: 'student' });
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          {/* <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
            Create your student account
          </Typography> */}
        </Box>

        {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Full Name *" value={form.name} required autoFocus
            onChange={e => set('name', e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" fontSize="small"/></InputAdornment> }}
          />
          <TextField
            label="Email Address *" type="email" value={form.email} required
            onChange={e => set('email', e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" fontSize="small"/></InputAdornment> }}
          />
          <TextField
            label="Password *" type={showPwd ? 'text' : 'password'}
            value={form.password} required helperText="Minimum 6 characters"
            onChange={e => set('password', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock color="action" fontSize="small"/></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <MuiIconButton size="small" onClick={() => setShowPwd(p => !p)} tabIndex={-1}>
                    {showPwd ? <VisibilityOff fontSize="small"/> : <Visibility fontSize="small"/>}
                  </MuiIconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirm Password *" type={showPwd ? 'text' : 'password'}
            value={form.confirmPassword} required
            onChange={e => set('confirmPassword', e.target.value)}
            error={!!form.confirmPassword && form.password !== form.confirmPassword}
            helperText={form.confirmPassword && form.password !== form.confirmPassword ? "Passwords don't match" : ''}
            InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="action" fontSize="small"/></InputAdornment> }}
          />

          <Button
            type="submit" variant="contained" size="large" fullWidth
            disabled={loading}
            sx={{ py: 1.5, fontWeight: 700, fontSize: '1rem', borderRadius: 2.5,
              bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
          >
            {loading ? <CircularProgress size={22} color="inherit"/> : 'Create Account'}
          </Button>
        </Box>

       <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F1F5F9', borderRadius: 2, border: '1px solid #E2E8F0' }}>
          <Typography variant="caption" sx={{ color: '#475569' }}>
            <strong>Instructor / Admin?</strong> Your account is created by the platform administrator.
          </Typography>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Typography variant="body2" textAlign="center" color="text.secondary">
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1a237e', fontWeight: 700, textDecoration: 'none' }}>
            Sign in here
          </Link>
        </Typography>
      </Card>
    </Box>
  );
}
