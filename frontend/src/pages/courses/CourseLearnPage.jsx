// CourseLearnPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  LinearProgress, Divider, IconButton, Drawer, useMediaQuery, Paper, Button } from '@mui/material';
import { PlayCircle, PictureAsPdf, CheckCircle, RadioButtonUnchecked, Menu, Assignment, Quiz } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { courseService, enrollmentService } from '../services/api';
import Navbar from '../components/common/Navbar';

const DRAWER_WIDTH = 320;

const CourseLearnPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');

  useEffect(() => {
    Promise.all([courseService.getCourseById(id), enrollmentService.getEnrollment(id)])
      .then(([courseRes, enrollRes]) => {
        setCourse(courseRes.data.data);
        setEnrollment(enrollRes.data.data);
        const firstLecture = courseRes.data.data?.sections?.[0]?.lectures?.[0];
        if (firstLecture) setActiveLecture(firstLecture);
      })
      .catch(console.error);
  }, [id]);

  const isCompleted = (lectureId) =>
    enrollment?.lectureProgress?.find((lp) => lp.lectureId === lectureId)?.completed || false;

  const markComplete = async (lectureId) => {
    try {
      const res = await enrollmentService.updateProgress(id, { lectureId, completed: true });
      setEnrollment(res.data.data);
    } catch (err) { console.error(err); }
  };

  const sidebar = (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={700} noWrap>{course?.title}</Typography>
        <LinearProgress variant="determinate" value={enrollment?.progress || 0} sx={{ mt: 1 }} />
        <Typography variant="caption" color="primary.main" fontWeight={600}>{enrollment?.progress || 0}% complete</Typography>
      </Box>
      {course?.sections?.map((section) => (
        <Box key={section._id}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
              {section.title}
            </Typography>
          </Box>
          <List disablePadding>
            {section.lectures?.map((lecture) => (
              <ListItem key={lecture._id} disablePadding>
                <ListItemButton
                  selected={activeLecture?._id === lecture._id}
                  onClick={() => setActiveLecture(lecture)}
                  sx={{ py: 1, px: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {isCompleted(lecture._id)
                      ? <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                      : <RadioButtonUnchecked sx={{ fontSize: 18, color: 'text.disabled' }} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={lecture.title}
                    primaryTypographyProps={{ variant: 'caption', fontWeight: activeLecture?._id === lecture._id ? 700 : 400 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {!isMobile && (
          <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', bgcolor: '#fff', overflow: 'auto' }}>
            {sidebar}
          </Box>
        )}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 4 } }}>
          {activeLecture ? (
            <Box>
              {isMobile && (
                <IconButton onClick={() => setMobileOpen(true)} sx={{ mb: 2 }}><Menu /></IconButton>
              )}
              {activeLecture.type === 'video' && (
                <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: '#000', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                  <Box component="iframe" src={activeLecture.url} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                </Box>
              )}
              {activeLecture.type === 'pdf' && (
                <Box sx={{ mb: 3 }}>
                  <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                    <PictureAsPdf sx={{ fontSize: 56, color: 'error.main', mb: 2 }} />
                    <Typography variant="h6" fontWeight={600} gutterBottom>{activeLecture.title}</Typography>
                    <Button href={activeLecture.url} target="_blank" variant="contained">Open PDF</Button>
                  </Paper>
                </Box>
              )}
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{activeLecture.title}</Typography>
              {activeLecture.description && (
                <Typography color="text.secondary" sx={{ mb: 3 }}>{activeLecture.description}</Typography>
              )}
              {!isCompleted(activeLecture._id) && (
                <Button variant="contained" startIcon={<CheckCircle />} onClick={() => markComplete(activeLecture._id)}>
                  Mark as Complete
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <PlayCircle sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">Select a lecture to start learning</Typography>
            </Box>
          )}
        </Box>
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: DRAWER_WIDTH } }}>
          {sidebar}
        </Drawer>
      </Box>
    </Box>
  );
};

export default CourseLearnPage;
