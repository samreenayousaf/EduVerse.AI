import React, { useState } from 'react';
import {
  Box, TextField, Button, InputAdornment, MenuItem, Alert,
} from '@mui/material';
import { Person, Email, Lock } from '@mui/icons-material';

export default function RegisterForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Box component="form" onSubmit={e => { e.preventDefault(); onSubmit(form); }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
      <TextField
        label="Full Name" value={form.name} required fullWidth
        onChange={e => set('name', e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }}
      />
      <TextField
        label="Email Address" type="email" value={form.email} required fullWidth
        onChange={e => set('email', e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }}
      />
      <TextField
        label="Password" type="password" value={form.password} required fullWidth
        onChange={e => set('password', e.target.value)}
        inputProps={{ minLength: 6 }}
        helperText="Minimum 6 characters"
        InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment> }}
      />
      <TextField select label="I am a…" value={form.role} fullWidth onChange={e => set('role', e.target.value)}>
        <MenuItem value="student">Student — I want to learn</MenuItem>
        <MenuItem value="instructor">Instructor — I want to teach</MenuItem>
      </TextField>
      <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}
        sx={{ py: 1.5, fontWeight: 700, mt: 1 }}>
        {loading ? 'Creating account…' : 'Create Account'}
      </Button>
    </Box>
  );
}
