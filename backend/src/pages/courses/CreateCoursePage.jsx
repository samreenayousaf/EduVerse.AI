import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Chip, IconButton, Stepper,
  Step, StepLabel, StepContent, Alert,
} from '@mui/material';
import { Add, Delete, Save, Publish } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { courseService } from '../../services/api';
import Navbar from '../../components/common/Navbar';

const CATEGORIES = ['Programming', 'Design', 'Business', 'Data Science', 'Marketing', 'Language', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const INITIAL_FORM = {
  title: '', description: '', category: '', level: 'Beginner', price: 0,
  language: 'English', tags: [], requirements: [], whatYouLearn: [],
  thumbnail: '', isPremium: false,
};

const CreateCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [wylInput, setWylInput] = useState('');

  useEffect(() => {
    if (id) {
      courseService.getCourseById(id)
        .then(({ data }) => setForm({ ...INITIAL_FORM, ...data.data }))
        .catch(console.error);
    }
  }, [id]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const addItem = (field, input, setInput) => {
    if (input.trim()) {
      setForm((prev) => ({ ...prev, [field]: [...prev[field], input.trim()] }));
      setInput('');
    }
  };

  const removeItem = (field, idx) => setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));

  const handleSubmit = async (publish = false) => {
    setLoading(true);
    try {
      const payload = { ...form, isPublished: publish };
      if (id) {
        await courseService.updateCourse(id, payload);
        enqueueSnackbar('Course updated!', { variant: 'success' });
      } else {
        const { data } = await courseService.createCourse(payload);
        enqueueSnackbar('Course created!', { variant: 'success' });
        navigate(`/courses/${data.data._id}`);
      }
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Error saving course.', { variant: 'error' });
    } finally { setLoading(false); }
  };

  const steps = ['Basic Info', 'Details', 'Content & Pricing'];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800}>{id ? 'Edit Course' : 'Create New Course'}</Typography>
          <Typography color="text.secondary">Fill in the details to {id ? 'update' : 'publish'} your course</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{ position: 'sticky', top: 80 }}>
              <CardContent sx={{ p: 2 }}>
                <Stepper activeStep={activeStep} orientation="vertical" sx={{ '& .MuiStepConnector-line': { minHeight: 20 } }}>
                  {steps.map((step, i) => (
                    <Step key={step}>
                      <StepLabel onClick={() => setActiveStep(i)} sx={{ cursor: 'pointer' }}>
                        <Typography variant="body2" fontWeight={activeStep === i ? 700 : 400}>{step}</Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={9}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                {activeStep === 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" fontWeight={700}>Basic Information</Typography>
                    <TextField fullWidth label="Course Title" name="title" value={form.title} onChange={handleChange} required />
                    <TextField fullWidth label="Description" name="description" value={form.description} onChange={handleChange}
                      multiline rows={4} required />
                    <TextField fullWidth label="Thumbnail URL" name="thumbnail" value={form.thumbnail} onChange={handleChange} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Category</InputLabel>
                          <Select name="category" value={form.category} label="Category" onChange={handleChange}>
                            {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Level</InputLabel>
                          <Select name="level" value={form.level} label="Level" onChange={handleChange}>
                            {LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {activeStep === 1 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" fontWeight={700}>Course Details</Typography>

                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Tags</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        {form.tags.map((tag, i) => (
                          <Chip key={i} label={tag} onDelete={() => removeItem('tags', i)} size="small" />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField size="small" placeholder="Add tag..." value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()} />
                        <Button onClick={addTag} variant="outlined" size="small">Add</Button>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Requirements</Typography>
                      {form.requirements.map((req, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip label={req} onDelete={() => removeItem('requirements', i)} />
                        </Box>
                      ))}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField size="small" placeholder="Add requirement..." value={reqInput}
                          onChange={(e) => setReqInput(e.target.value)} fullWidth />
                        <Button onClick={() => addItem('requirements', reqInput, setReqInput)} variant="outlined" size="small">Add</Button>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>What You'll Learn</Typography>
                      {form.whatYouLearn.map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip label={item} onDelete={() => removeItem('whatYouLearn', i)} />
                        </Box>
                      ))}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField size="small" placeholder="Add learning outcome..." value={wylInput}
                          onChange={(e) => setWylInput(e.target.value)} fullWidth />
                        <Button onClick={() => addItem('whatYouLearn', wylInput, setWylInput)} variant="outlined" size="small">Add</Button>
                      </Box>
                    </Box>
                  </Box>
                )}

                {activeStep === 2 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" fontWeight={700}>Pricing & Publishing</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth type="number" label="Price ($)" name="price"
                          value={form.price} onChange={handleChange} inputProps={{ min: 0 }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Language" name="language"
                          value={form.language} onChange={handleChange} />
                      </Grid>
                    </Grid>
                    <Alert severity="info">
                      After creating, go to the course page to add sections and lectures.
                    </Alert>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                  {activeStep > 0 && (
                    <Button variant="outlined" onClick={() => setActiveStep((s) => s - 1)}>Back</Button>
                  )}
                  {activeStep < steps.length - 1 ? (
                    <Button variant="contained" onClick={() => setActiveStep((s) => s + 1)}>Next</Button>
                  ) : (
                    <>
                      <Button variant="outlined" startIcon={<Save />} onClick={() => handleSubmit(false)} disabled={loading}>
                        Save Draft
                      </Button>
                      <Button variant="contained" startIcon={<Publish />} onClick={() => handleSubmit(true)} disabled={loading}>
                        {loading ? 'Saving...' : 'Publish Course'}
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CreateCoursePage;
