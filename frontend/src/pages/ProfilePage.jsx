import React, { useState } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, TextField, Button,
  Avatar, Chip, Alert, Divider, InputAdornment, IconButton,
} from '@mui/material';
import { Person, Email, Edit, Save, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');

  const handleSave = () => {
    updateUser(profile);
    toast.success('Profile updated!');
    setEditing(false);
  };

  const handlePwdChange = () => {
    if (!pwdForm.current || !pwdForm.newPwd) { setPwdError('All fields required.'); return; }
    if (pwdForm.newPwd !== pwdForm.confirm) { setPwdError('Passwords do not match.'); return; }
    if (pwdForm.newPwd.length < 6) { setPwdError('Password must be at least 6 characters.'); return; }
    setPwdError('');
    toast.success('Password changed!');
    setPwdForm({ current:'', newPwd:'', confirm:'' });
  };

  const roleColors = { student:'#1a237e', instructor:'#4a148c', admin:'#b71c1c' };
  const color = roleColors[user?.role] || '#1a237e';

  return (
    <Container maxWidth="md" sx={{ py:4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>My Profile</Typography>
      <Typography color="text.secondary" sx={{ mb:4 }}>Manage your account settings</Typography>

      <Grid container spacing={3}>
        {/* Profile card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p:3, textAlign:'center' }}>
              <Avatar sx={{ width:80, height:80, bgcolor:color, fontSize:32, fontWeight:800, mx:'auto', mb:2 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{user?.email}</Typography>
              <Chip label={user?.role} sx={{ mt:1, textTransform:'capitalize',
                bgcolor:`${color}15`, color, fontWeight:700 }} />
              {user?.bio && (
                <Typography variant="body2" color="text.secondary" sx={{ mt:2 }}>
                  {user.bio}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Edit form */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb:3 }}>
            <CardContent sx={{ p:3 }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
                <Typography variant="h6" fontWeight={700}>Profile Information</Typography>
                <Button
                  startIcon={editing ? <Save /> : <Edit />}
                  variant={editing ? 'contained' : 'outlined'}
                  size="small"
                  onClick={editing ? handleSave : () => setEditing(true)}
                >
                  {editing ? 'Save' : 'Edit'}
                </Button>
              </Box>
              <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
                <TextField label="Full Name" value={profile.name}
                  onChange={e => setProfile({...profile, name:e.target.value})}
                  disabled={!editing} fullWidth
                  InputProps={{ startAdornment:<InputAdornment position="start"><Person color="action" /></InputAdornment> }}
                />
                <TextField label="Email Address" value={user?.email || ''} disabled fullWidth
                  InputProps={{ startAdornment:<InputAdornment position="start"><Email color="action" /></InputAdornment> }}
                  helperText="Email cannot be changed"
                />
                <TextField label="Bio" value={profile.bio} multiline rows={3}
                  onChange={e => setProfile({...profile, bio:e.target.value})}
                  disabled={!editing} fullWidth placeholder="Tell us about yourself…"
                />
              </Box>
              {editing && (
                <Button onClick={() => setEditing(false)} variant="outlined" sx={{ mt:2 }}>
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Change password */}
          <Card>
            <CardContent sx={{ p:3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Change Password</Typography>
              <Divider sx={{ mb:3 }} />
              {pwdError && <Alert severity="error" sx={{ mb:2 }}>{pwdError}</Alert>}
              <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
                {['current','newPwd','confirm'].map((field, i) => (
                  <TextField key={field}
                    label={['Current Password','New Password','Confirm New Password'][i]}
                    type={showPwd ? 'text' : 'password'}
                    value={pwdForm[field]}
                    onChange={e => setPwdForm({...pwdForm, [field]:e.target.value})}
                    fullWidth
                    InputProps={{
                      startAdornment:<InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                      ...(i===0 ? { endAdornment:(
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPwd(!showPwd)} size="small">
                            {showPwd ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )} : {}),
                    }}
                  />
                ))}
                <Button variant="contained" onClick={handlePwdChange} sx={{ alignSelf:'flex-start' }}>
                  Update Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
