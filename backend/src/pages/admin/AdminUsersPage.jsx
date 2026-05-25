// AdminUsersPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Chip, IconButton, TextField,
  InputAdornment, Select, MenuItem, FormControl, InputLabel, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { Search, Edit, Delete, PersonAdd } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminService } from '../services/api';
import Navbar from '../components/common/Navbar';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getAllUsers({ search, role: roleFilter });
      setUsers(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const handleUpdate = async () => {
    try {
      await adminService.updateUser(editUser._id, { role: editUser.role, isActive: editUser.isActive });
      enqueueSnackbar('User updated!', { variant: 'success' });
      setEditUser(null);
      fetchUsers();
    } catch { enqueueSnackbar('Update failed.', { variant: 'error' }); }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteUser(deleteConfirm._id);
      enqueueSnackbar('User deleted.', { variant: 'success' });
      setDeleteConfirm(null);
      fetchUsers();
    } catch { enqueueSnackbar('Delete failed.', { variant: 'error' }); }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight={800}>Manage Users</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField size="small" placeholder="Search users..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Role</InputLabel>
              <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="instructor">Instructor</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={28} /></TableCell></TableRow>
                ) : users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={user.avatar} sx={{ width: 34, height: 34, fontSize: '0.8rem',
                          background: 'linear-gradient(135deg, #0F4C81, #00B4D8)' }}>{user.name?.[0]}</Avatar>
                        <Typography variant="body2" fontWeight={600}>{user.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{user.email}</Typography></TableCell>
                    <TableCell>
                      <Chip label={user.role} size="small" fontWeight={700}
                        color={user.role === 'admin' ? 'error' : user.role === 'instructor' ? 'secondary' : 'primary'} />
                    </TableCell>
                    <TableCell>
                      <Chip label={user.isActive ? 'Active' : 'Inactive'} size="small"
                        color={user.isActive ? 'success' : 'error'} variant="outlined" />
                    </TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{new Date(user.createdAt).toLocaleDateString()}</Typography></TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => setEditUser({ ...user })} color="primary"><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => setDeleteConfirm(user)} color="error"><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="xs" fullWidth>
          <DialogTitle fontWeight={700}>Edit User</DialogTitle>
          <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {editUser && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select value={editUser.role} label="Role" onChange={(e) => setEditUser((p) => ({ ...p, role: e.target.value }))}>
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="instructor">Instructor</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={editUser.isActive ? 'active' : 'inactive'} label="Status"
                    onChange={(e) => setEditUser((p) => ({ ...p, isActive: e.target.value === 'active' }))}>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditUser(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdate}>Save Changes</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirm */}
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle fontWeight={700}>Confirm Delete</DialogTitle>
          <DialogContent><Typography>Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.</Typography></DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminUsersPage;
