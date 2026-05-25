// AssignmentsPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Grid, Chip, Button, CircularProgress, LinearProgress } from '@mui/material';
import { Assignment, CheckCircle, Schedule, Warning } from '@mui/icons-material';
import { enrollmentService, assignmentService } from '../services/api';
import Navbar from '../components/common/Navbar';
import dayjs from 'dayjs';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentService.getMyEnrollments()
      .then(async ({ data }) => {
        const allAssignments = await Promise.all(
          data.data.map((e) => e.course?._id
            ? assignmentService.getCourseAssignments(e.course._id).then((r) => r.data.data).catch(() => [])
            : []
          )
        );
        setAssignments(allAssignments.flat());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatus = (assignment) => {
    const now = dayjs();
    const due = dayjs(assignment.dueDate);
    if (due.isBefore(now)) return { label: 'Overdue', color: 'error', icon: <Warning fontSize="small" /> };
    if (due.diff(now, 'day') <= 3) return { label: 'Due Soon', color: 'warning', icon: <Schedule fontSize="small" /> };
    return { label: 'Active', color: 'success', icon: <CheckCircle fontSize="small" /> };
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800}>My Assignments</Typography>
          <Typography color="text.secondary">Track and submit your course assignments</Typography>
        </Box>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
        ) : assignments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Assignment sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No assignments yet. Enroll in courses to get started!</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {assignments.map((assignment) => {
              const status = getStatus(assignment);
              return (
                <Grid item xs={12} md={6} key={assignment._id}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Chip label={status.label} size="small" color={status.color} icon={status.icon} />
                        <Typography variant="caption" color="text.secondary">
                          Due: {dayjs(assignment.dueDate).format('MMM D, YYYY')}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>{assignment.title}</Typography>
                      <Typography color="text.secondary" variant="body2" sx={{ mb: 2, display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {assignment.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={600}>Total: {assignment.totalMarks} marks</Typography>
                        <Button variant="contained" size="small">View Assignment</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default AssignmentsPage;
