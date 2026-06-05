// NotFoundPage.jsx
import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { SentimentDissatisfied, Home } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #0F4C81, #00B4D8)' }}>
    <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
      <SentimentDissatisfied sx={{ fontSize: 96, color: 'rgba(255,255,255,0.5)', mb: 2 }} />
      <Typography variant="h1" fontWeight={800} sx={{ color: '#fff', fontSize: '6rem', lineHeight: 1, mb: 1 }}>404</Typography>
      <Typography variant="h5" fontWeight={700} sx={{ color: '#fff', mb: 1 }}>Page Not Found</Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>
        Oops! The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button component={Link} to="/" variant="contained" size="large" startIcon={<Home />}
        sx={{ bgcolor: '#fff', color: 'primary.main', fontWeight: 700 }}>
        Back to Home
      </Button>
    </Container>
  </Box>
);

export default NotFoundPage;
