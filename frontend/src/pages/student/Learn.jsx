import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Card, List, ListItem, ListItemIcon,
  ListItemText, Button, Chip, CircularProgress, LinearProgress,
  Divider, IconButton,
} from '@mui/material';
import {
  PlayCircle, CheckCircle, Lock, ArrowBack,
  Assignment, Quiz, PictureAsPdf, Schedule,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { courseAPI, enrollAPI } from '../../services/api';

export default function StudentLearn() {
  const { courseId }    = useParams();
  const navigate        = useNavigate();
  const [course,        setCourse]      = useState(null);
  const [enrollment,    setEnrollment]  = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);
  const [loading,       setLoading]     = useState(true);
  const [marking,       setMarking]     = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, eRes] = await Promise.all([
          courseAPI.getOne(courseId),
          enrollAPI.getMyEnroll(),
        ]);
        setCourse(cRes.data);
        const enr = eRes.data.find(e =>
          (e.courseId?._id || e.courseId) === courseId
        );
        setEnrollment(enr);
        // Set first lecture as active
        if (cRes.data.lectures?.length > 0)
          setActiveLecture(cRes.data.lectures[0]);
      } catch { toast.error('Failed to load course'); }
      finally { setLoading(false); }
    };
    load();
  }, [courseId]);

  const completedIds = new Set(enrollment?.completedLectures || []);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
      /youtu\.be\/([^?&]+)/,
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtube\.com\/embed\/([^?&]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  };

  const markComplete = async (lectureId) => {
    if (!enrollment) return;
    setMarking(true);
    try {
      const completed = [...completedIds, lectureId];
      const total     = course.lectures?.length || 1;
      const progress  = Math.round((completed.length / total) * 100);
      await enrollAPI.updateProgress(courseId, { progress, lectureId });
      setEnrollment(e => ({
        ...e,
        completedLectures: completed,
        progress,
      }));
      toast.success('Lecture marked complete! ✅');
    } catch { toast.error('Update failed'); }
    finally { setMarking(false); }
  };

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <CircularProgress size={48}/>
    </Box>
  );
  if (!course) return null;

  const ytId = activeLecture ? getYouTubeId(activeLecture.content) : null;
  const progress = enrollment?.progress || 0;

  return (
    <Box>
      {/* Back + title */}
      <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:3 }}>
        <IconButton onClick={() => navigate('/student/courses')} size="small">
          <ArrowBack/>
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight={800}>{course.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            by {course.instructorName} · {course.lectures?.length || 0} lectures
          </Typography>
        </Box>
      </Box>

      {/* Progress bar */}
      <Box sx={{ mb:3 }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
          <Typography variant="body2" fontWeight={600}>Course Progress</Typography>
          <Typography variant="body2" fontWeight={700} color="primary">{progress}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress}
          sx={{ height:8, borderRadius:4,
            '& .MuiLinearProgress-bar':{ bgcolor:'#1a237e' } }}/>
        <Typography variant="caption" color="text.secondary" sx={{ mt:0.5, display:'block' }}>
          {completedIds.size} of {course.lectures?.length || 0} lectures completed
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Video Player */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius:3, overflow:'hidden' }}>
            {/* Video */}
            {activeLecture ? (
              <>
                {ytId ? (
                  <Box sx={{ position:'relative', paddingTop:'56.25%', bgcolor:'#000' }}>
                    <iframe
                      style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
                      src={`https://www.youtube.com/embed/${ytId}?rel=0`}
                      title={activeLecture.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </Box>
                ) : (
                  <Box sx={{ paddingTop:'56.25%', position:'relative', bgcolor:'#1a1a2e' }}>
                    <Box sx={{ position:'absolute', inset:0, display:'flex',
                      alignItems:'center', justifyContent:'center', flexDirection:'column', gap:2 }}>
                      <PlayCircle sx={{ fontSize:64, color:'rgba(255,255,255,0.3)' }}/>
                      <Typography color="rgba(255,255,255,0.6)" variant="body2">
                        Add YouTube URL to this lecture to show video
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Lecture info */}
                <Box sx={{ p:3 }}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{activeLecture.title}</Typography>
                      <Box sx={{ display:'flex', gap:1, mt:0.5 }}>
                        <Chip label={activeLecture.type || 'video'} size="small" variant="outlined"/>
                        {activeLecture.duration && (
                          <Chip icon={<Schedule sx={{ fontSize:'14px !important' }}/>}
                            label={activeLecture.duration} size="small" variant="outlined"/>
                        )}
                        {completedIds.has(activeLecture._id?.toString() || activeLecture.id) && (
                          <Chip icon={<CheckCircle sx={{ fontSize:'14px !important' }}/>}
                            label="Completed" size="small" color="success"/>
                        )}
                      </Box>
                    </Box>
                    {!completedIds.has(activeLecture._id?.toString() || activeLecture.id) && (
                      <Button variant="contained" startIcon={<CheckCircle/>}
                        onClick={() => markComplete(activeLecture._id?.toString() || activeLecture.id)}
                        disabled={marking}
                        sx={{ bgcolor:'#00897b', '&:hover':{ bgcolor:'#00695c' } }}>
                        {marking ? <CircularProgress size={18} color="inherit"/> : 'Mark Complete'}
                      </Button>
                    )}
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ p:6, textAlign:'center' }}>
                <Typography color="text.secondary">Select a lecture from the list</Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Lecture List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius:3 }}>
            <Box sx={{ p:2.5, borderBottom:'1px solid #f0f0f0' }}>
              <Typography variant="subtitle1" fontWeight={700}>Course Content</Typography>
            </Box>
            <List disablePadding sx={{ maxHeight:500, overflowY:'auto' }}>
              {course.lectures?.map((lec, idx) => {
                const lecId    = lec._id?.toString() || lec.id || String(idx);
                const done     = completedIds.has(lecId);
                const isActive = activeLecture?._id?.toString() === lec._id?.toString() ||
                                 activeLecture?.title === lec.title;
                return (
                  <React.Fragment key={idx}>
                    <ListItem
                      onClick={() => setActiveLecture(lec)}
                      sx={{
                        cursor:'pointer', py:1.5,
                        bgcolor: isActive ? '#e8eaf6' : 'transparent',
                        '&:hover':{ bgcolor: isActive ? '#e8eaf6' : '#f8f9ff' },
                        borderLeft: isActive ? '3px solid #1a237e' : '3px solid transparent',
                      }}>
                      <ListItemIcon sx={{ minWidth:36 }}>
                        {done
                          ? <CheckCircle sx={{ color:'#00897b', fontSize:20 }}/>
                          : lec.isFree
                            ? <PlayCircle sx={{ color:'#1a237e', fontSize:20 }}/>
                            : <Lock sx={{ color:'#bbb', fontSize:20 }}/>}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={isActive ? 700 : 400}
                            sx={{ color: isActive ? '#1a237e' : 'text.primary' }}>
                            {idx + 1}. {lec.title}
                          </Typography>
                        }
                        secondary={lec.duration}
                      />
                    </ListItem>
                    {idx < course.lectures.length - 1 && <Divider sx={{ mx:2 }}/>}
                  </React.Fragment>
                );
              })}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
