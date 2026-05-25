// QuizzesPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Grid, Chip, Button, CircularProgress, LinearProgress } from '@mui/material';
import { Quiz, Timer, CheckCircle, EmojiEvents } from '@mui/icons-material';
import { enrollmentService, quizService } from '../services/api';
import Navbar from '../components/common/Navbar';

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentService.getMyEnrollments()
      .then(async ({ data }) => {
        const all = await Promise.all(
          data.data.map((e) => e.course?._id
            ? quizService.getCourseQuizzes(e.course._id).then((r) => r.data.data).catch(() => [])
            : []
          )
        );
        setQuizzes(all.flat());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800}>My Quizzes</Typography>
          <Typography color="text.secondary">Test your knowledge and track your scores</Typography>
        </Box>
        {loading ? <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
          : quizzes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Quiz sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No quizzes available yet.</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {quizzes.map((quiz) => (
                <Grid item xs={12} md={6} lg={4} key={quiz._id}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>{quiz.title}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip icon={<Timer fontSize="small" />} label={`${quiz.timeLimit} min`} size="small" variant="outlined" />
                        <Chip icon={<Quiz fontSize="small" />} label={`${quiz.questions?.length || 0} questions`} size="small" variant="outlined" />
                        <Chip icon={<EmojiEvents fontSize="small" />} label={`Pass: ${quiz.passingScore}%`} size="small" color="primary" variant="outlined" />
                      </Box>
                      <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>{quiz.description}</Typography>
                      <Button variant="contained" fullWidth>Start Quiz</Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
      </Container>
    </Box>
  );
};

export default QuizzesPage;
