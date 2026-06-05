import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  Divider, Alert, CircularProgress, InputAdornment, IconButton,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { Save, Lock, Person, Email, Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import { authAPI, adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { user, updateUser } = useAuth();
  const [profile,  setProfile]  = useState({ name: '', email: '' });
  const [pwdForm,  setPwdForm]  = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwd,  setShowPwd]  = useState({ current: false, new: false, confirm: false });
  const [saving,   setSaving]   = useState({ profile: false, password: false, instructor: false });
  const [instrForm, setInstrForm] = useState({ name: '', email: '', newPassword: '' });
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', email: user.email || '' });
    adminAPI.getUsers().then(res => {
      setInstructors(res.data.filter(u => u.role === 'instructor'));
    }).catch(() => {});
  }, [user]);

  // Save admin profile
  const handleProfileSave = async () => {
    setSaving(s => ({ ...s, profile: true }));
    try {
      const res = await authAPI.updateProfile({ name: profile.name });
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(s => ({ ...s, profile: false })); }
  };

  // Change admin password
  const handlePasswordSave = async () => {
    if (pwdForm.newPassword !== pwdForm.confirmPassword)
      return toast.error('Passwords do not match!');
    if (pwdForm.newPassword.length < 6)
      return toast.error('Password must be at least 6 characters');
    setSaving(s => ({ ...s, password: true }));
    try {
      await authAPI.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword:     pwdForm.newPassword,
      });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(s => ({ ...s, password: false })); }
  };

  // Update instructor credentials
  const handleInstructorUpdate = async () => {
    if (!instrForm.email) return toast.error('Select an instructor first');
    const target = instructors.find(i => i.email === instrForm.email);
    if (!target) return toast.error('Instructor not found');
    setSaving(s => ({ ...s, instructor: true }));
    try {
      const payload = {};
      if (instrForm.name) payload.name = instrForm.name;
      if (instrForm.newPassword) payload.newPassword = instrForm.newPassword;
      await adminAPI.updateUser(target.id, payload);
      toast.success('Instructor updated! They will receive a notification.');
      setInstrForm({ name: '', email: '', newPassword: '' });
      const res = await adminAPI.getUsers();
      setInstructors(res.data.filter(u => u.role === 'instructor'));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(s => ({ ...s, instructor: false })); }
  };

  const Section = ({ title, subtitle, children }) => (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{subtitle}</Typography>}
        <Divider sx={{ mb: 2.5 }} />
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Manage your account and platform credentials" />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {/* Admin Profile */}
          <Section title="My Profile" subtitle="Update your admin account details">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Full Name" value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }}
              />
              <TextField label="Email Address" value={profile.email} disabled
                helperText="Email cannot be changed"
                InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }}
              />
              <Button variant="contained" startIcon={<Save />}
                onClick={handleProfileSave} disabled={saving.profile}>
                {saving.profile ? <CircularProgress size={18} color="inherit" /> : 'Save Profile'}
              </Button>
            </Box>
          </Section>

          {/* Change Admin Password */}
          <Section title="Change My Password" subtitle="Keep your admin account secure">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { key: 'currentPassword', label: 'Current Password', field: 'current' },
                { key: 'newPassword',     label: 'New Password',     field: 'new'     },
                { key: 'confirmPassword', label: 'Confirm Password', field: 'confirm' },
              ].map(({ key, label, field }) => (
                <TextField key={key} label={label} fullWidth
                  type={showPwd[field] ? 'text' : 'password'}
                  value={pwdForm[key]}
                  onChange={e => setPwdForm(p => ({ ...p, [key]: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPwd(s => ({ ...s, [field]: !s[field] }))}>
                          {showPwd[field] ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ))}
              <Button variant="contained" color="warning" startIcon={<Lock />}
                onClick={handlePasswordSave} disabled={saving.password}>
                {saving.password ? <CircularProgress size={18} color="inherit" /> : 'Change Password'}
              </Button>
            </Box>
          </Section>
        </Grid>

        <Grid item xs={12} md={6}>
          {/* Manage Instructor Credentials */}
          <Section title="Manage Instructor Credentials"
            subtitle="Update name or reset password for any instructor">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="instructor-select-label">Select Instructor</InputLabel>
                <Select
                  labelId="instructor-select-label"
                  label="Select Instructor"
                  value={instrForm.email}
                  onChange={e => {
                    const instr = instructors.find(i => i.email === e.target.value);
                    setInstrForm({ email: e.target.value, name: instr?.name || '', newPassword: '' });
                  }}
                  MenuProps={{ disablePortal: false, PaperProps: { sx: { mt: 0.5, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } } }}
                >
                  <MenuItem value="">— Choose instructor —</MenuItem>
                  {instructors.map(i => (
                    <MenuItem key={i.id} value={i.email}>{i.name} ({i.email})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Update Name (optional)" value={instrForm.name}
                onChange={e => setInstrForm(f => ({ ...f, name: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }}
              />
              <TextField label="Set New Password (optional)" type="password"
                value={instrForm.newPassword}
                onChange={e => setInstrForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="Leave empty to keep current password"
                helperText="Min 6 characters"
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment> }}
              />
              <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
                Instructor will receive a notification about any changes.
              </Alert>
              <Button variant="contained" color="secondary" startIcon={<Save />}
                onClick={handleInstructorUpdate} disabled={saving.instructor || !instrForm.email}>
                {saving.instructor ? <CircularProgress size={18} color="inherit" /> : 'Update Instructor'}
              </Button>
            </Box>
          </Section>

          {/* Instructor List */}
          <Section title="Current Instructors">
            {instructors.length === 0 ? (
              <Typography color="text.secondary" variant="body2">No instructors found.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {instructors.map(i => (
                  <Box key={i.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                    p: 1.5, borderRadius: 2, bgcolor: '#f8f9ff', border: '1px solid #e8eaf6' }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#4a148c',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 14 }}>
                      {i.name?.charAt(0)}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{i.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{i.email}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Section>
        </Grid>
      </Grid>
    </Box>
  );
}