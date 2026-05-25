import React, { useState } from 'react';
import {
  Box, TextField, Button, InputAdornment, IconButton, Alert,
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';

export default function LoginForm({ onSubmit, loading, error }) {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Box component="form" onSubmit={e => { e.preventDefault(); onSubmit(form); }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
      <TextField
        label="Email Address" type="email" value={form.email} required fullWidth
        onChange={e => set('email', e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }}
      />
      <TextField
        label="Password" type={showPwd ? 'text' : 'password'} value={form.password} required fullWidth
        onChange={e => set('password', e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPwd(!showPwd)} size="small">
                {showPwd ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}
        sx={{ py: 1.5, fontWeight: 700, mt: 1 }}>
        {loading ? 'Signing in…' : 'Sign In'}
      </Button>
    </Box>
  );
}
