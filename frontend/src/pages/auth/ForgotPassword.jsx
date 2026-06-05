import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, CircularProgress, Alert, Link,
} from '@mui/material';
import { Email, School, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function ForgotPassword() {
  const navigate  = useNavigate();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true); setError('');
    try {
      await authAPI.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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

          {sent ? (
            <Box>
              <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#F0FDF4',
                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <Email sx={{ color: '#16A34A', fontSize: 28 }}/>
              </Box>
              <Typography variant="h5" fontWeight={800} color="#111827" mb={1}>Check your email</Typography>
              <Typography color="#6B7280" mb={3} fontSize="0.9rem">
                If <strong>{email}</strong> is registered, you'll receive a password reset link within a few minutes.
              </Typography>
              <Alert severity="info" sx={{ borderRadius: 2, mb: 3, fontSize: '0.82rem' }}>
                Didn't receive it? Check your spam folder, or try again with a different email.
              </Alert>
              <Button fullWidth variant="outlined" onClick={() => navigate('/login')} startIcon={<ArrowBack/>}
                sx={{ borderRadius: 2, fontWeight: 700 }}>
                Back to Login
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" fontWeight={800} color="#111827" mt={2} mb={1}>Forgot Password?</Typography>
              <Typography color="#6B7280" mb={3} fontSize="0.9rem">
                Enter your registered email and we'll send you a link to reset your password.
              </Typography>

              {error && <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.82rem' }}>{error}</Alert>}

              <TextField
                fullWidth label="Email Address" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                sx={{ mb: 3 }}
                InputProps={{ startAdornment: <Email sx={{ mr: 1, color: '#9CA3AF' }}/> }}
              />

              <Button fullWidth variant="contained" onClick={handleSubmit} disabled={loading}
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, bgcolor: '#283593',
                  '&:hover': { bgcolor: '#1F2937' }, mb: 2 }}>
                {loading ? <CircularProgress size={20} color="inherit"/> : 'Send Reset Link'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link onClick={() => navigate('/login')} sx={{ cursor: 'pointer', color: '#6B7280', fontSize: '0.85rem',
                  display: 'inline-flex', alignItems: 'center', gap: 0.5, '&:hover': { color: '#111827' } }}>
                  <ArrowBack sx={{ fontSize: 14 }}/> Back to Login
                </Link>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}