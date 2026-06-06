
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, TableContainer, Table, TableHead, TableRow, TableCell,
  TableBody, Avatar, Chip, IconButton, Switch, CircularProgress, TextField, InputAdornment } from '@mui/material';
import { Search, Delete, Edit } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/api';

import Layout from '../../components/common/Layout';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCourses();
      
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, [search]);

  const handleToggle = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await adminAPI.updateCourseStatus(id, { status: newStatus });
      setCourses(prev => prev.map(c => (c._id || c.id) === id ? { ...c, status: newStatus } : c));
      toast.success(`Course ${newStatus}`);
    } catch { toast.error('Toggle failed.'); }
  };

  const filtered = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={800}>Manage Courses</Typography>
        <TextField size="small" placeholder="Search courses..." value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
      </Box>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Instructor</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Enrollments</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Published</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={28} /></TableCell></TableRow>
              ) : filtered.map(course => (
                <TableRow key={course._id || course.id} hover>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar variant="rounded" src={course.thumbnail}
                        sx={{ width: 44, height: 44, borderRadius: 2,
                          background: 'linear-gradient(135deg, #0F4C81, #00B4D8)', fontSize: '0.8rem' }}>
                        {course.title?.[0]}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {course.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{course.instructorName || '—'}</Typography>
                  </TableCell>
                  <TableCell><Chip label={course.category} size="small" variant="outlined" /></TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {course.enrolledStudents?.length || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}
                      color={course.price ? 'text.primary' : 'success.main'}>
                      {course.price > 0 ? `$${course.price}` : 'Free'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={course.status === 'published'}
                      onChange={() => handleToggle(course._id || course.id, course.status)}
                      color="success"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary"><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  );
};

export default AdminCoursesPage;