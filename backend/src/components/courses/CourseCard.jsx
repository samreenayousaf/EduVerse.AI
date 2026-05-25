import React from 'react';
import {
  Card, CardMedia, CardContent, CardActions, Box, Typography,
  Chip, Button, Avatar, Rating, LinearProgress, Tooltip,
} from '@mui/material';
import { People, AccessTime, BarChart, ArrowForward, Lock } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

const CATEGORY_COLORS = {
  Programming: '#0F4C81',
  Design: '#7B2D8B',
  Business: '#B5451B',
  'Data Science': '#0A6E49',
  Marketing: '#D4700A',
  Language: '#1565C0',
  Other: '#424242',
};

const CourseCard = ({ course, enrolled = false, progress = 0 }) => {
  const categoryColor = CATEGORY_COLORS[course.category] || '#424242';

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      '&:hover .course-thumbnail': { transform: 'scale(1.05)' },
    }}>
      {/* Thumbnail */}
      <Box sx={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden', bgcolor: 'grey.100' }}>
        <CardMedia
          component="img"
          className="course-thumbnail"
          image={course.thumbnail || `https://picsum.photos/seed/${course._id}/640/360`}
          alt={course.title}
          sx={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover', transition: 'transform 0.4s ease',
          }}
        />
        {/* Overlay badges */}
        <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 0.75 }}>
          <Chip label={course.category} size="small"
            sx={{ backgroundColor: categoryColor, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
          {course.isPremium && (
            <Chip icon={<Lock sx={{ fontSize: '0.8rem !important' }} />} label="Premium" size="small"
              sx={{ backgroundColor: '#FFB703', color: '#000', fontWeight: 700, fontSize: '0.7rem' }} />
          )}
        </Box>
        <Box sx={{ position: 'absolute', bottom: 10, right: 10 }}>
          <Chip
            label={course.level}
            size="small"
            icon={<BarChart sx={{ fontSize: '0.8rem !important' }} />}
            sx={{
              backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff',
              backdropFilter: 'blur(4px)', fontWeight: 600, fontSize: '0.7rem',
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <Rating value={course.rating || 0} readOnly size="small" precision={0.5} />
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            ({course.totalRatings || 0})
          </Typography>
        </Box>

        {/* Title */}
        <Typography variant="subtitle1" fontWeight={700} sx={{
          mb: 1, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {course.title}
        </Typography>

        {/* Instructor */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Avatar src={course.instructor?.avatar} sx={{ width: 22, height: 22, fontSize: '0.7rem',
            background: 'linear-gradient(135deg, #0F4C81, #00B4D8)' }}>
            {course.instructor?.name?.[0]}
          </Avatar>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {course.instructor?.name}
          </Typography>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <People sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{course.totalEnrollments || 0}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{course.totalDuration || 0}m</Typography>
          </Box>
        </Box>

        {/* Progress bar (if enrolled) */}
        {enrolled && (
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" fontWeight={600} color="primary.main">Progress</Typography>
              <Typography variant="caption" fontWeight={700} color="primary.main">{progress}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            {course.price > 0 ? `$${course.price}` : 'Free'}
          </Typography>
          <Button
            component={Link}
            to={enrolled ? `/courses/${course._id}/learn` : `/courses/${course._id}`}
            variant="contained"
            size="small"
            endIcon={<ArrowForward />}
            sx={{ borderRadius: 2 }}
          >
            {enrolled ? 'Continue' : 'View Course'}
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default CourseCard;
