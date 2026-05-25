import React, { useState, useEffect } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Avatar, Chip, IconButton, TextField, InputAdornment, Button,
  Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Typography, Switch, CircularProgress,
  Alert,
} from '@mui/material';
import { Search, Edit, Delete, CheckCircle, Block, Refresh, Lock, PersonAdd } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { adminAPI } from '../../services/api';

const roleColors = { student:'#1a237e', instructor:'#4a148c', admin:'#b71c1c' };

export default function AdminUsers() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [deleteId,   setDeleteId]   = useState(null);
  const [editUser,   setEditUser]   = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [saving,     setSaving]     = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [createForm,   setCreateForm]   = useState({ name:'', email:'', password:'' });
  const [creating,     setCreating]     = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    (u.name?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === 'All' || u.role === roleFilter)
  );

  const handleToggle = async (u) => {
    try {
      await adminAPI.updateUser(u.id, { isActive: !u.isActive });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: !x.isActive } : x));
      toast.success(`User ${!u.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteUser(deleteId);
      setUsers(prev => prev.filter(u => u.id !== deleteId));
      toast.success('User deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleteId(null); }
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      const payload = { name: editUser.name, role: editUser.role, bio: editUser.bio || '' };
      if (newPassword.trim()) payload.newPassword = newPassword.trim();
      await adminAPI.updateUser(editUser.id, payload);
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...payload } : u));
      toast.success('User updated successfully');
      setEditUser(null); setNewPassword('');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password)
      return toast.error('All fields required');
    if (createForm.password.length < 6)
      return toast.error('Password min 6 characters');
    setCreating(true);
    try {
      // Admin sends token in header so backend allows instructor role
      await adminAPI.createInstructor(createForm);
      toast.success(`✅ Instructor "${createForm.name}" created! They can now login.`);
      setCreateDialog(false);
      setCreateForm({ name:'', email:'', password:'' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create instructor');
    } finally { setCreating(false); }
  };

  return (
    <Box>
      <PageHeader title="User Management" subtitle={`${users.length} total users`}
        action={
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchUsers} size="small">
            Refresh
          </Button>
        }
      />

      <Box sx={{ display:'flex', gap:2, mb:3 }}>
        <TextField placeholder="Search by name or email…" value={search}
          onChange={e => setSearch(e.target.value)} size="small" sx={{ flex:1 }}
          InputProps={{ startAdornment:<InputAdornment position="start"><Search color="action" /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth:140 }}>
          <InputLabel>Role</InputLabel>
          <Select value={roleFilter} label="Role" onChange={e => setRoleFilter(e.target.value)}>
            {['All','student','instructor','admin'].map(r => (
              <MenuItem key={r} value={r} sx={{ textTransform:'capitalize' }}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Card>
        {loading ? (
          <Box sx={{ p:6, textAlign:'center' }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p:6, textAlign:'center' }}>
            <Typography color="text.secondary">No users found.</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ '& th':{ fontWeight:700, bgcolor:'#f8f9ff' } }}>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id} sx={{ '&:hover':{ bgcolor:'#f4f6fb' }, '&:last-child td':{ border:0 } }}>
                  <TableCell>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                      <Avatar sx={{ width:36, height:36, bgcolor:roleColors[u.role]||'#888', fontSize:14, fontWeight:700 }}>
                        {u.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={u.role} size="small"
                      sx={{ bgcolor:`${roleColors[u.role]||'#888'}15`, color:roleColors[u.role]||'#888',
                        fontWeight:700, textTransform:'capitalize' }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                      <Switch size="small" checked={!!u.isActive}
                        onChange={() => handleToggle(u)} color="success" />
                      <Chip
                        label={u.isActive ? 'Active' : 'Inactive'} size="small"
                        icon={u.isActive
                          ? <CheckCircle sx={{ fontSize:'14px !important' }} />
                          : <Block sx={{ fontSize:'14px !important' }} />}
                        color={u.isActive ? 'success' : 'default'}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-PK') : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-PK') : 'Never'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => { setEditUser({...u}); setNewPassword(''); }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteId(u.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Edit Dialog */}
      {editUser && (
        <Dialog open onClose={() => setEditUser(null)} maxWidth="xs" fullWidth
          PaperProps={{ sx:{ borderRadius:4 } }}>
          <DialogTitle fontWeight={700}>Edit User</DialogTitle>
          <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, pt:'16px !important' }}>
            <TextField label="Full Name" value={editUser.name || ''}
              onChange={e => setEditUser({...editUser, name:e.target.value})} fullWidth />
            <TextField label="Email" value={editUser.email || ''} disabled fullWidth
              helperText="Email cannot be changed" />
            <TextField select label="Role" value={editUser.role || 'student'}
              onChange={e => setEditUser({...editUser, role:e.target.value})} fullWidth>
              {['student','instructor','admin'].map(r => (
                <MenuItem key={r} value={r} sx={{ textTransform:'capitalize' }}>{r}</MenuItem>
              ))}
            </TextField>
            <TextField label="New Password (optional)" type="password"
              value={newPassword} onChange={e => setNewPassword(e.target.value)}
              fullWidth placeholder="Leave empty to keep current"
              helperText="Min 6 characters"
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment> }}
            />
            <Alert severity="info" sx={{ borderRadius:2, fontSize:'0.8rem' }}>
              User will receive a notification about any changes.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px:3, pb:3 }}>
            <Button onClick={() => setEditUser(null)} variant="outlined">Cancel</Button>
            <Button onClick={handleEdit} variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={18} color="inherit" /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <ConfirmDialog open={Boolean(deleteId)} title="Delete User"
        message="Are you sure? This action cannot be undone."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      {/* Create Instructor Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle fontWeight={700}>Create Instructor Account</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2.5, pt:'16px !important' }}>
          <TextField label="Full Name *" value={createForm.name} fullWidth autoFocus
            onChange={e => setCreateForm(f=>({...f,name:e.target.value}))}/>
          <TextField label="Email Address *" type="email" value={createForm.email} fullWidth
            onChange={e => setCreateForm(f=>({...f,email:e.target.value}))}/>
          <TextField label="Password *" type="password" value={createForm.password} fullWidth
            helperText="Min 6 characters"
            onChange={e => setCreateForm(f=>({...f,password:e.target.value}))}/>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:3 }}>
          <Button onClick={() => setCreateDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}
            sx={{ bgcolor:'#4a148c', '&:hover':{ bgcolor:'#6a1b9a' } }}>
            {creating ? <CircularProgress size={18} color="inherit"/> : 'Create Instructor'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
