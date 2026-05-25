import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, Typography, Button, Chip, TextField,
  InputAdornment, CircularProgress, Avatar, LinearProgress,
  Tabs, Tab, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  Search, PlayCircle, People, Schedule,
  CheckCircle, FilterList, School,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { courseAPI, enrollAPI } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';

const TABS       = ['All Courses', 'Enrolled', 'Not Enrolled', 'Completed'];
const CATEGORIES = ['All', 'Web Development', 'Data Science', 'Design', 'Business', 'Mobile Development', 'Marketing'];
const LEVELS     = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const CAT_COLORS = {
  'Web Development': '#6366f1', 'Data Science': '#0891b2',
  'Design': '#7c3aed', 'Business': '#ea580c', 'Mobile Development': '#059669',
  'Marketing': '#db2777',
};

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
  'linear-gradient(135deg, #0fd850 0%, #f9f047 100%)',
  'linear-gradient(135deg, #fa8231 0%, #f7b731 100%)',
  'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
];

function CourseCard({ course, enrollment, onEnroll, enrolling, onClick }) {
  const { mode } = useThemeMode();
  const isDark   = mode === 'dark';
  const color    = CAT_COLORS[course.category] || '#6366f1';
  const enrolled = !!enrollment;
  const progress = enrollment?.progress || 0;
  const gradIdx  = course.title.charCodeAt(0) % GRADIENTS.length;

  return (
    <Card sx={{
      borderRadius: 3, overflow: 'hidden', cursor: 'pointer',
      border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
      bgcolor: isDark ? '#1F2937' : '#fff',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Thumbnail */}
      <Box sx={{ height: 140, background: GRADIENTS[gradIdx], position: 'relative' }} onClick={onClick}>
        <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
          <Chip label={course.category || 'General'} size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 600, fontSize: '0.7rem', backdropFilter: 'blur(4px)' }}
          />
        </Box>
        {enrolled && (
          <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
            <Chip icon={<CheckCircle sx={{ fontSize: '14px !important', color: '#fff !important' }}/>}
              label={`${progress}%`} size="small"
              sx={{ bgcolor: 'rgba(0,0,0,0.4)', color: '#fff', fontWeight: 700 }}/>
          </Box>
        )}
        <Chip label={course.level || 'Beginner'} size="small"
          sx={{ position: 'absolute', bottom: 10, right: 10,
            bgcolor: 'rgba(0,0,0,0.35)', color: '#fff', fontSize: '0.65rem', backdropFilter: 'blur(4px)' }}/>
        {enrolled && (
          <LinearProgress variant="determinate" value={progress}
            sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
              bgcolor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': { bgcolor: '#fff' } }}/>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }} onClick={onClick}>
        <Typography variant="subtitle1" fontWeight={700}
          sx={{ mb: 0.5, lineHeight: 1.3, color: isDark ? '#F9FAFB' : '#111827' }} noWrap>
          {course.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Avatar sx={{ width: 20, height: 20, bgcolor: color, fontSize: 10, fontWeight: 700 }}>
            {course.instructorName?.charAt(0)}
          </Avatar>
          <Typography variant="caption" sx={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            {course.instructorName}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <People sx={{ fontSize: 13, color: '#9CA3AF' }}/>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              {course.enrolledStudents?.length || 0}
            </Typography>
          </Box>
          {course.duration && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <Schedule sx={{ fontSize: 13, color: '#9CA3AF' }}/>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{course.duration}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <PlayCircle sx={{ fontSize: 13, color: '#9CA3AF' }}/>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              {(course.weeks || []).reduce((s, w) => s + w.activities.length, 0)} items
            </Typography>
          </Box>
        </Box>

        <Button fullWidth variant={enrolled ? 'outlined' : 'contained'} size="small"
          disabled={enrolling} onClick={e => { e.stopPropagation(); enrolled ? onClick() : onEnroll(); }}
          sx={{
            mt: 'auto', borderRadius: 2, fontWeight: 700, fontSize: '0.8rem',
            borderColor: color,
            color: enrolled ? color : '#fff',
            bgcolor: enrolled ? 'transparent' : color,
            '&:hover': { bgcolor: enrolled ? `${color}15` : `${color}dd`, borderColor: color },
          }}>
          {enrolling
            ? <CircularProgress size={14} color="inherit"/>
            : enrolled ? (enrollment?.status === 'completed' ? '✅ Completed' : '👁 View Course') : 'Enroll Now'}
        </Button>
      </Box>
    </Card>
  );
}

export default function StudentCourses() {
  const navigate  = useNavigate();
  const { mode }  = useThemeMode();
  const isDark    = mode === 'dark';

  const [courses,     setCourses]     = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [search,      setSearch]      = useState('');
  const [tabIdx,      setTabIdx]      = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [enrolling,   setEnrolling]   = useState({});
  const [category,    setCategory]    = useState('All');
  const [level,       setLevel]       = useState('All');
  const [sortBy,      setSortBy]      = useState('name');

  const surface = isDark ? '#1F2937' : '#fff';
  const border  = isDark ? '#374151' : '#E5E7EB';
  const txt     = isDark ? '#F9FAFB' : '#111827';
  const sub     = isDark ? '#9CA3AF' : '#6B7280';

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, eRes] = await Promise.all([courseAPI.getAll(), enrollAPI.getMyEnroll()]);
        setCourses(cRes.data);
        setEnrollments(eRes.data);
      } catch { toast.error('Failed to load courses'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const enrolledMap = {};
  enrollments.forEach(e => { enrolledMap[e.courseId?._id || e.courseId] = e; });

  const handleEnroll = async (courseId, courseTitle) => {
    setEnrolling(p => ({ ...p, [courseId]: true }));
    try {
      await enrollAPI.enroll(courseId);
      const eRes = await enrollAPI.getMyEnroll();
      setEnrollments(eRes.data);
      // Proper top notification
      toast.success(`🎉 Successfully enrolled in "${courseTitle}"!`, {
        position: 'top-right',
        autoClose: 4000,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed. Try again.', {
        position: 'top-right',
      });
    } finally { setEnrolling(p => ({ ...p, [courseId]: false })); }
  };

  const filtered = courses.filter(c => {
    const cId = c._id || c.id;
    const enr = enrolledMap[cId];
    const matchSearch   = !search   || c.title?.toLowerCase().includes(search.toLowerCase()) || c.instructorName?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || c.category === category;
    const matchLevel    = level === 'All'    || c.level === level;
    if (!matchSearch || !matchCategory || !matchLevel) return false;
    if (tabIdx === 1) return !!enr && enr.status !== 'completed';
    if (tabIdx === 2) return !enr;
    if (tabIdx === 3) return enr?.status === 'completed';
    return true;
  }).sort((a, b) => {
    if (sortBy === 'name')     return a.title.localeCompare(b.title);
    if (sortBy === 'students') return (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0);
    if (sortBy === 'newest')   return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const enrolledCount   = Object.keys(enrolledMap).length;
  const completedCount  = enrollments.filter(e => e.status === 'completed').length;

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <CircularProgress size={48}/>
    </Box>
  );

  return (
    <Box>
      {/* Header - CENTERED */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={800} sx={{ color: txt }}>My Courses</Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: `1px solid ${border}`, mb: 3 }}>
        <Tabs value={tabIdx} onChange={(_, v) => setTabIdx(v)}
          sx={{ '& .MuiTab-root': { fontSize: '0.835rem', fontWeight: 600, color: sub, minWidth: 'auto', px: 2 },
            '& .Mui-selected': { color: txt },
            '& .MuiTabs-indicator': { bgcolor: txt } }}>
          {TABS.map((t, i) => (
            <Tab key={i} label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                {t}
                {i === 1 && enrolledCount > 0 && (
                  <Chip label={enrolledCount} size="small"
                    sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#1a237e', color: '#fff', fontWeight: 700 }}/>
                )}
                {i === 3 && completedCount > 0 && (
                  <Chip label={completedCount} size="small"
                    sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#00897b', color: '#fff', fontWeight: 700 }}/>
                )}
              </Box>
            }/>
          ))}
        </Tabs>
      </Box>

      {/* Filters row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search courses or instructors…"
          value={search} onChange={e => setSearch(e.target.value)}
          size="small" sx={{ flex: 1, minWidth: 200,
            '& .MuiOutlinedInput-root': { bgcolor: surface, borderRadius: 2,
              '& fieldset': { borderColor: border } } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: sub, fontSize: 18 }}/></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: sub }}>Category</InputLabel>
          <Select value={category} label="Category" onChange={e => setCategory(e.target.value)}
            sx={{ bgcolor: surface, color: txt, borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: border } }}>
            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel sx={{ color: sub }}>Level</InputLabel>
          <Select value={level} label="Level" onChange={e => setLevel(e.target.value)}
            sx={{ bgcolor: surface, color: txt, borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: border } }}>
            {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: sub }}>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={e => setSortBy(e.target.value)}
            sx={{ bgcolor: surface, color: txt, borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: border } }}>
            <MenuItem value="name">Name A–Z</MenuItem>
            <MenuItem value="students">Most Students</MenuItem>
            <MenuItem value="newest">Newest First</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Results count */}
      <Typography variant="body2" sx={{ color: sub, mb: 2 }}>
        {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
      </Typography>

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: surface,
          border: `1px solid ${border}`, borderRadius: 3 }}>
          <School sx={{ fontSize: 64, color: border, mb: 2 }}/>
          <Typography variant="h6" sx={{ color: sub }}>No courses found</Typography>
          <Typography variant="body2" sx={{ color: sub, mt: 0.5 }}>Try adjusting your search or filters</Typography>
          <Button sx={{ mt: 2 }} onClick={() => { setSearch(''); setCategory('All'); setLevel('All'); setTabIdx(0); }}>
            Clear Filters
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ px: { xs: 0, md: 1 } }}>
          {filtered.map(c => {
            const cId = c._id || c.id;
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={cId}>
                <CourseCard
                  course={c}
                  enrollment={enrolledMap[cId]}
                  enrolling={!!enrolling[cId]}
                  onEnroll={() => handleEnroll(cId, c.title)}
                  onClick={() => navigate(`/student/course/${cId}`)}
                />
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
