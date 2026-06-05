import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, CircularProgress, Alert, InputAdornment, IconButton, Link,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, School, CheckCircle, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function ResetPassword() {
  const navigate    = useNavigate();
  const { token }   = useParams();
  const [form,      setForm]      = useState({ password: '', confirm: '' });
  const [show,      setShow]      = useState({ password: false, confirm: false });
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match'); return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, { newPassword: form.password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. The link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: '#F9FAFB', px: 2,
    }}>
      <Card sx={{ maxWidth: 440, width: '100%', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#111827',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <School sx={{ color: '#fff', fontSize: 20 }}/>
            </Box>
            <Typography fontWeight={800} fontSize="1.1rem" color="#111827">EduVerse</Typography>
          </Box>

          {done ? (
            <Box>
              <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#F0FDF4',
                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <CheckCircle sx={{ color: '#16A34A', fontSize: 32 }}/>
              </Box>
              <Typography variant="h5" fontWeight={800} color="#111827" mb={1}>Password Reset!</Typography>
              <Typography color="#6B7280" mb={3} fontSize="0.9rem">
                Your password has been reset successfully. You can now log in with your new password.
              </Typography>
              <Button fullWidth variant="contained" onClick={() => navigate('/login')}
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, bgcolor: '#111827', '&:hover': { bgcolor: '#1F2937' } }}>
                Go to Login
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" fontWeight={800} color="#111827" mb={1}>Set New Password</Typography>
              <Typography color="#6B7280" mb={3} fontSize="0.9rem">
                Choose a strong password for your account.
              </Typography>

              {error && <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.82rem' }}>{error}</Alert>}

              <TextField fullWidth label="New Password" type={show.password ? 'text' : 'password'}
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: '#9CA3AF' }}/>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShow(s => ({ ...s, password: !s.password }))}>
                        {show.password ? <VisibilityOff fontSize="small"/> : <Visibility fontSize="small"/>}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField fullWidth label="Confirm Password" type={show.confirm ? 'text' : 'password'}
                value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: '#9CA3AF' }}/>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}>
                        {show.confirm ? <VisibilityOff fontSize="small"/> : <Visibility fontSize="small"/>}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button fullWidth variant="contained" onClick={handleSubmit} disabled={loading}
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, bgcolor: '#111827',
                  '&:hover': { bgcolor: '#1F2937' }, mb: 2 }}>
                {loading ? <CircularProgress size={20} color="inherit"/> : 'Reset Password'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link onClick={() => navigate('/forgot-password')} sx={{ cursor: 'pointer', color: '#6B7280',
                  fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 0.5,
                  '&:hover': { color: '#111827' } }}>
                  <ArrowBack sx={{ fontSize: 14 }}/> Request new link
                </Link>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
