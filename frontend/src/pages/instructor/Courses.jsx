import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  CircularProgress, IconButton,
} from '@mui/material';
import { Edit, People, School, OpenInNew } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { courseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function InstructorCourses() {
  const { user }      = useAuth();
  const { mode }      = useThemeMode();
  const navigate      = useNavigate();
  const isDark        = mode === 'dark';
  const surface       = isDark ? '#1F2937' : '#fff';
  const border        = isDark ? '#374151' : '#E5E7EB';
  const txt           = isDark ? '#F9FAFB' : '#111827';
  const sub           = isDark ? '#9CA3AF' : '#6B7280';
  const hover         = isDark ? '#374151' : '#F3F4F6';

  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseAPI.getMyCourses();
      setCourses(res.data);
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <CircularProgress size={48}/>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb:3 }}>
        <Typography variant="h5" fontWeight={800} sx={{ color:txt }}>My Courses</Typography>
      </Box>

      {courses.length === 0 ? (
        <Card sx={{ p:6, textAlign:'center', borderRadius:3, bgcolor:surface,
          border:`1px solid ${border}`, boxShadow:'none' }}>
          <School sx={{ fontSize:64, color:border, mb:2 }}/>
          <Typography variant="h6" sx={{ color:sub, mb:1 }}>No courses assigned yet</Typography>
          <Typography variant="body2" sx={{ color:sub }}>
            Contact your admin to get courses assigned to you.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {courses.map(c => {
            const cId = c._id || c.id;
            return (
              <Grid item xs={12} sm={6} md={4} key={cId}>
                <Card sx={{ height:'100%', display:'flex', flexDirection:'column',
                  bgcolor:surface, border:`1px solid ${border}`, borderRadius:3,
                  boxShadow:'none', transition:'transform 0.2s, box-shadow 0.2s',
                  '&:hover':{ transform:'translateY(-2px)', boxShadow:3 } }}>
                  <Box sx={{ height:6, bgcolor: c.status==='published'?'#10b981':'#9CA3AF',
                    borderRadius:'12px 12px 0 0' }}/>
                  <CardContent sx={{ flex:1, p:3 }}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', mb:1.5 }}>
                      <Chip label={c.status} size="small"
                        color={c.status==='published'?'success':'default'}
                        sx={{ fontWeight:700, fontSize:'0.7rem' }}/>
                      <Chip label={c.category} size="small" variant="outlined"
                        sx={{ fontSize:'0.7rem', color:sub }}/>
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb:1, lineHeight:1.3, color:txt }}>
                      {c.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color:sub, mb:2,
                      display:'-webkit-box', WebkitLineClamp:2,
                      WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {c.description}
                    </Typography>
                    <Box sx={{ display:'flex', gap:1.5, mb:2.5, flexWrap:'wrap' }}>
                      <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                        <People sx={{ fontSize:15, color:sub }}/>
                        <Typography variant="caption" sx={{ color:sub }}>
                          {c.enrolledStudents?.length||0} students
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color:sub }}>·</Typography>
                      <Typography variant="caption" sx={{ color:sub }}>{c.level}</Typography>
                      <Typography variant="caption" sx={{ color:sub }}>·</Typography>
                      <Typography variant="caption" sx={{ color:sub }}>
                        {(c.weeks||[]).reduce((s,w)=>s+w.activities.length,0)} activities
                      </Typography>
                    </Box>
                    <Button fullWidth variant="contained" startIcon={<OpenInNew sx={{ fontSize:15 }}/>}
                      onClick={() => navigate(`/instructor/course/${cId}`)}
                      sx={{ bgcolor: isDark?'#374151':'#1F2937', color:'#fff', borderRadius:2,
                        fontSize:'0.8rem', fontWeight:700,
                        '&:hover':{ bgcolor: isDark?'#4B5563':'#111827' } }}>
                      Manage Course
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
