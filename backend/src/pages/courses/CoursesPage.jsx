import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, CardMedia, Typography, Chip, Button, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Avatar, Rating, Pagination, Stack, Skeleton } from '@mui/material';
import { Search, People, AccessTime, PlayCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { courseService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'AI/ML', 'Design'];
const LEVELS = ['All Levels', 'beginner', 'intermediate', 'advanced'];

const CourseCard = ({ course, onEnroll }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEnrolled = user && course.enrolledStudents?.includes(user.id);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia component="img" height="160" image={course.thumbnail || `https://picsum.photos/seed/${course._id}/400/200`} alt={course.title}
          sx={{ objectFit: 'cover', bgcolor: '#EFF6FF' }} />
        <Chip label={course.level} size="small" sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', fontWeight: 600, textTransform: 'capitalize' }} />
        {course.isPremium && <Chip label="Premium" size="small" color="warning" sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 700 }} />}
      </Box>
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Chip label={course.category} size="small" sx={{ mb: 1.5, bgcolor: '#EFF6FF', color: 'primary.main', fontWeight: 600, alignSelf: 'flex-start' }} />
        <Typography variant="body1" fontWeight={700} gutterBottom lineHeight={1.4} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2 }}>
          {course.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Avatar src={course.instructor?.avatar} sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'primary.main' }}>
            {course.instructor?.name?.[0]}
          </Avatar>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>{course.instructor?.name}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <People sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">{course.enrolledStudents?.length || 0} students</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <PlayCircle sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">{course.lectures?.length || 0} lectures</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
          <Typography variant="h6" fontWeight={800} color={course.price === 0 ? 'success.main' : 'text.primary'}>
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </Typography>
          <Button variant={isEnrolled ? 'outlined' : 'contained'} size="small" onClick={() => isEnrolled ? navigate('/student/courses') : onEnroll(course._id)}
            sx={{ borderRadius: 2, fontWeight: 600 }}>
            {isEnrolled ? 'Continue' : 'Enroll Now'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All Levels');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (level !== 'All Levels') params.level = level;
      const { data } = await courseService.getAll(params);
      setCourses(data.courses);
      setTotalPages(data.pages);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, [page, category, level]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchCourses(); };

  const handleEnroll = async (id) => {
    try {
      await courseService.enroll(id);
      toast.success('Enrolled successfully! 🎉');
      fetchCourses();
    } catch {}
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #1e3a8a, #4c1d95)', py: 8, px: 3, textAlign: 'center', color: 'white' }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>Explore Our Courses</Typography>
        <Typography sx={{ opacity: 0.85, mb: 4, fontSize: '1.1rem' }}>Learn from industry experts with AI-powered personalized learning</Typography>
        <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 500, mx: 'auto' }}>
          <TextField fullWidth placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment>, sx: { bgcolor: 'white', borderRadius: 3 } }} />
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1 }}>
            {CATEGORIES.map((cat) => (
              <Chip key={cat} label={cat} onClick={() => { setCategory(cat); setPage(1); }}
                color={category === cat ? 'primary' : 'default'} variant={category === cat ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600, cursor: 'pointer' }} />
            ))}
          </Box>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Level</InputLabel>
            <Select value={level} label="Level" onChange={(e) => { setLevel(e.target.value); setPage(1); }} sx={{ borderRadius: 2 }}>
              {LEVELS.map((l) => <MenuItem key={l} value={l} sx={{ textTransform: 'capitalize' }}>{l}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {/* Course Grid */}
        <Grid container spacing={3}>
          {loading ? Array(9).fill(0).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}><Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} /></Grid>
          )) : courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course._id}>
              <CourseCard course={course} onEnroll={handleEnroll} />
            </Grid>
          ))}
        </Grid>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="large" />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CoursesPage;
