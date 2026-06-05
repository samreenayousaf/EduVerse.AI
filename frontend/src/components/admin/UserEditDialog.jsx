import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Switch, FormControlLabel, Box, Avatar, Typography,
} from '@mui/material';
import { roleColor } from '../../utils/helpers';

export default function UserEditDialog({ open, user, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', role: 'student', isActive: true });

  useEffect(() => {
    if (user) setForm({ name: user.name || '', role: user.role || 'student', isActive: user.isActive !== false });
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const color = roleColor(form.role);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle fontWeight={800}>Edit User</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f4f6fb', borderRadius: 2 }}>
          <Avatar sx={{ bgcolor: color, width: 44, height: 44, fontWeight: 800 }}>
            {form.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700}>{form.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
        </Box>
        <TextField label="Full Name" value={form.name} onChange={e => set('name', e.target.value)} fullWidth />
        <TextField select label="Role" value={form.role} onChange={e => set('role', e.target.value)} fullWidth>
          {['student', 'instructor', 'admin'].map(r => (
            <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>
          ))}
        </TextField>
        <Box sx={{ p: 2, bgcolor: '#f4f6fb', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" fontWeight={600}>Account Active</Typography>
            <Typography variant="caption" color="text.secondary">Inactive users cannot log in</Typography>
          </Box>
          <Switch checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={() => onSave?.({ ...user, ...form })}>Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
}
