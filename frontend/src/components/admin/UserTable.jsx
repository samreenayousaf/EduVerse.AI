import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Avatar, Chip,
  IconButton, Tooltip, Box, Typography, TablePagination,
} from '@mui/material';
import { Edit, Delete, Block, CheckCircle } from '@mui/icons-material';
import { roleColor } from '../../utils/helpers';
import ConfirmDialog from '../common/ConfirmDialog';

export default function UserTable({ users = [], onEdit, onDelete, onToggleStatus }) {
  const [page, setPage]       = useState(0);
  const [rowsPerPage]         = useState(8);
  const [confirmId, setConfirmId] = useState(null);

  const paginated = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f4f6fb', fontSize: '0.8rem' } }}>
            <TableCell>User</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Courses</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map(u => {
            const color = roleColor(u.role);
            return (
              <TableRow key={u._id} sx={{ '&:hover': { bgcolor: '#f9f9fc' }, '&:last-child td': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: color, width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={u.role} size="small"
                    sx={{ bgcolor: `${color}15`, color, fontWeight: 700, textTransform: 'capitalize', fontSize: '0.72rem' }} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{u.enrolledCourses?.length || u.createdCourses?.length || 0}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={u.isActive !== false ? 'Active' : 'Inactive'}
                    color={u.isActive !== false ? 'success' : 'default'}
                    icon={u.isActive !== false
                      ? <CheckCircle sx={{ fontSize: '13px !important' }} />
                      : <Block sx={{ fontSize: '13px !important' }} />}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit?.(u)}><Edit fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title={u.isActive !== false ? 'Deactivate' : 'Activate'}>
                    <IconButton size="small" color={u.isActive !== false ? 'warning' : 'success'}
                      onClick={() => onToggleStatus?.(u)}>
                      {u.isActive !== false ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setConfirmId(u._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[8]}
      />

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Delete User"
        message="Are you sure you want to permanently delete this user? All their data will be removed."
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={() => { onDelete?.(confirmId); setConfirmId(null); }}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}
