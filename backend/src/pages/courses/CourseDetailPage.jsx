// CourseDetailPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, Button, Chip,
  Avatar, Rating, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress,
} from '@mui/material';
import {
  ExpandMore, PlayCircle, PictureAsPdf, Link as LinkIcon,
  People, AccessTime, BarChart, CheckCircle, School, Lock,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { courseService, enrollmentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';

export const CourseDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await courseService.getCourseById(id);
        setCourse(data.data);
        if (isAuthenticated) {
          try {
            await enrollmentService.getEnrollment(id);
            setEnrolled(true);
          } catch {}
        }
      } catch { navigate('/courses'); }
      finally { setLoading(false); }
    };
    fetchCourse();
  }, [id, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      await enrollmentService.enroll(id);
      setEnrolled(true);
      enqueueSnackbar('Successfully enrolled! 🎉', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Enrollment failed.', { variant: 'error' });
    } finally { setEnrolling(false); }
  };

  if (loading) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Navbar /><CircularProgress />
    </Box>
  );
  if (!course) return null;

  const lectureIcon = (type) => ({ video: <PlayCircle color="primary" />, pdf: <PictureAsPdf color="error" />, link: <LinkIcon color="secondary" /> }[type] || <PlayCircle />);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box sx={{ background: 'linear-gradient(135deg, #0F4C81 0%, #0096C7 100%)', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Chip label={course.category} sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
              <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', mb: 2 }}>{course.title}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.85)', mb: 3 }}>{course.description}</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Rating value={course.rating} readOnly size="small" sx={{ '& .MuiRating-icon': { color: '#FFB703' } }} />
                  <Typography sx={{ color: '#FFB703', fontWeight: 700 }}>{course.rating?.toFixed(1)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'rgba(255,255,255,0.8)' }}>
                  <People fontSize="small" /> <Typography variant="body2">{course.totalEnrollments} students</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'rgba(255,255,255,0.8)' }}>
                  <BarChart fontSize="small" /> <Typography variant="body2">{course.level}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={course.instructor?.avatar} sx={{ width: 36, height: 36 }}>{course.instructor?.name?.[0]}</Avatar>
                <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  Instructor: <strong>{course.instructor?.name}</strong>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, position: 'sticky', top: 80 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 2 }}>
                    {course.price > 0 ? `$${course.price}` : 'Free'}
                  </Typography>
                  {enrolled ? (
                    <Button fullWidth variant="contained" size="large" onClick={() => navigate(`/courses/${id}/learn`)}
                      startIcon={<PlayCircle />} sx={{ mb: 2 }}>Continue Learning</Button>
                  ) : (
                    <Button fullWidth variant="contained" size="large" onClick={handleEnroll}
                      disabled={enrolling} sx={{ mb: 2 }}>
                      {enrolling ? 'Enrolling...' : course.price > 0 ? 'Buy Now' : 'Enroll Free'}
                    </Button>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      { icon: <School fontSize="small" />, text: `${course.sections?.length || 0} sections` },
                      { icon: <PlayCircle fontSize="small" />, text: `${course.totalLectures || 0} lectures` },
                      { icon: <AccessTime fontSize="small" />, text: `${course.totalDuration || 0} minutes` },
                    ].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {React.cloneElement(item.icon, { sx: { color: 'text.secondary', fontSize: '1rem' } })}
                        <Typography variant="body2" color="text.secondary">{item.text}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {course.whatYouLearn?.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>What You'll Learn</Typography>
                  <Grid container spacing={1}>
                    {course.whatYouLearn.map((item, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <CheckCircle sx={{ color: 'success.main', fontSize: 18, mt: 0.2 }} />
                          <Typography variant="body2">{item}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}

            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Course Content</Typography>
            {course.sections?.map((section) => (
              <Accordion key={section._id} defaultExpanded sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography fontWeight={600}>{section.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5 }}>
                    ({section.lectures?.length} lectures)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List disablePadding>
                    {section.lectures?.map((lecture, i) => (
                      <React.Fragment key={lecture._id}>
                        {i > 0 && <Divider />}
                        <ListItem sx={{ py: 1.5, px: 3 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>{lectureIcon(lecture.type)}</ListItemIcon>
                          <ListItemText
                            primary={lecture.title}
                            secondary={lecture.duration > 0 ? `${lecture.duration} min` : ''}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                          />
                          {!lecture.isPreview && !enrolled && <Lock sx={{ fontSize: 16, color: 'text.disabled' }} />}
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CourseDetailPage;
