import React, { useState } from 'react';
import {
  Box, Card, Typography, TextField, Button, Avatar,
  Grid, Divider, Alert, CircularProgress, InputAdornment,
  IconButton,
} from '@mui/material';
import { Person, Email, Lock, Visibility, VisibilityOff, Save, Edit } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentProfile() {
  const { user, updateUser, changePassword } = useAuth();
  const [profile,  setProfile]  = useState({ name: user?.name||'', bio: user?.bio||'' });
  const [pwdForm,  setPwdForm]  = useState({ current:'', newPwd:'', confirm:'' });
  const [showPwd,  setShowPwd]  = useState({ c:false, n:false, cf:false });
  const [saving,   setSaving]   = useState({ profile:false, pwd:false });

  const handleProfileSave = async () => {
    setSaving(s => ({ ...s, profile:true }));
    try {
      const res = await authAPI.updateProfile({ name: profile.name, bio: profile.bio });
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(s => ({ ...s, profile:false })); }
  };

  const handlePwdSave = async () => {
    if (pwdForm.newPwd !== pwdForm.confirm)
      return toast.error('Passwords do not match');
    if (pwdForm.newPwd.length < 6)
      return toast.error('Password must be at least 6 characters');
    setSaving(s => ({ ...s, pwd:true }));
    try {
      if (changePassword) {
        await changePassword(pwdForm.current, pwdForm.newPwd);
      } else {
        await authAPI.changePassword({ currentPassword: pwdForm.current, newPassword: pwdForm.newPwd });
      }
      setPwdForm({ current:'', newPwd:'', confirm:'' });
      toast.success('Password changed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wrong current password');
    } finally { setSaving(s => ({ ...s, pwd:false })); }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb:3 }}>My Profile</Typography>
      <Grid container spacing={3}>

        {/* Profile Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p:3.5, borderRadius:3 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:3 }}>
              <Avatar sx={{ width:64, height:64, bgcolor:'#1a237e', fontSize:26, fontWeight:800 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform:'capitalize' }}>
                  {user?.role}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb:3 }}/>
            <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
              <TextField label="Full Name" value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name:e.target.value }))}
                InputProps={{ startAdornment:<InputAdornment position="start"><Person color="action" fontSize="small"/></InputAdornment> }}
              />
              <TextField label="Email" value={user?.email||''} disabled
                helperText="Email cannot be changed"
                InputProps={{ startAdornment:<InputAdornment position="start"><Email color="action" fontSize="small"/></InputAdornment> }}
              />
              <TextField label="Bio" value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio:e.target.value }))}
                multiline rows={2} placeholder="Tell us about yourself..."
              />
              <Button variant="contained" startIcon={<Save/>}
                onClick={handleProfileSave} disabled={saving.profile}
                sx={{ bgcolor:'#1a237e' }}>
                {saving.profile ? <CircularProgress size={18} color="inherit"/> : 'Save Profile'}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Password Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p:3.5, borderRadius:3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Change Password</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb:2.5 }}>
              Keep your account secure
            </Typography>
            <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
              {[
                { key:'current', label:'Current Password', field:'c' },
                { key:'newPwd',  label:'New Password',     field:'n' },
                { key:'confirm', label:'Confirm Password', field:'cf' },
              ].map(({ key, label, field }) => (
                <TextField key={key} label={label} fullWidth
                  type={showPwd[field] ? 'text' : 'password'}
                  value={pwdForm[key]}
                  onChange={e => setPwdForm(p => ({ ...p, [key]:e.target.value }))}
                  InputProps={{
                    startAdornment:<InputAdornment position="start"><Lock color="action" fontSize="small"/></InputAdornment>,
                    endAdornment:<InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPwd(s => ({ ...s, [field]:!s[field] }))}>
                        {showPwd[field] ? <VisibilityOff fontSize="small"/> : <Visibility fontSize="small"/>}
                      </IconButton>
                    </InputAdornment>,
                  }}
                />
              ))}
              <Button variant="contained" color="warning" startIcon={<Lock/>}
                onClick={handlePwdSave} disabled={saving.pwd}>
                {saving.pwd ? <CircularProgress size={18} color="inherit"/> : 'Change Password'}
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
