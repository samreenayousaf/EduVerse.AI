import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, LinearProgress,
  Avatar, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import {
  School, TrendingUp, Assignment, Quiz as QuizIcon, EmojiEvents,
} from '@mui/icons-material';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { gradeLabel, gradeColor } from '../../utils/helpers';

const radar = [
  { subject:'Assignments', A:88 }, { subject:'Quizzes', A:82 },
  { subject:'Projects',    A:91 }, { subject:'Attendance', A:95 },
  { subject:'Participation', A:78 },
];
const weekly = [
  { week:'W1', score:65 }, { week:'W2', score:72 }, { week:'W3', score:68 },
  { week:'W4', score:80 }, { week:'W5', score:85 }, { week:'W6', score:91 },
];
const courses = [
  { name:'React & Node.js', progress:72, grade:88, status:'In Progress' },
  { name:'Data Science',    progress:45, grade:76, status:'In Progress' },
  { name:'UI/UX Design',    progress:90, grade:94, status:'Near Complete' },
];

export default function StudentAnalytics() {
  return (
    <Box>
      <PageHeader title="My Analytics" subtitle="Track your learning performance and progress" />

      <Grid container spacing={3} sx={{ mb:4 }}>
        {[
          { title:'Overall Progress', value:'69%', icon:<TrendingUp />, color:'#1a237e', trend:8 },
          { title:'Avg. Assignment', value:'86%', icon:<Assignment />, color:'#00897b', trend:5  },
          { title:'Avg. Quiz Score', value:'82%', icon:<QuizIcon />,   color:'#6a1b9a', trend:12 },
          { title:'Courses Enrolled', value:'3',  icon:<School />,     color:'#e65100'           },
        ].map((s,i) => <Grid item xs={12} sm={6} md={3} key={i}><StatCard {...s} /></Grid>)}
      </Grid>

      <Grid container spacing={3}>
        {/* Radar */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ p:3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Skills Overview</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize:12 }} />
                  <Radar name="Score" dataKey="A" stroke="#1a237e" fill="#1a237e" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly bar */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p:3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Weekly Scores</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize:12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize:12 }} domain={[0,100]} />
                  <Tooltip formatter={v => [`${v}%`,'Score']} />
                  <Bar dataKey="score" fill="#1a237e" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Course table */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p:3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Course Performance</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((c,i) => (
                    <TableRow key={i} sx={{ '&:last-child td':{ border:0 } }}>
                      <TableCell>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                          <Avatar sx={{ bgcolor:'#1a237e15', width:34, height:34 }}>
                            <School sx={{ color:'#1a237e', fontSize:18 }} />
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                          <LinearProgress variant="determinate" value={c.progress}
                            sx={{ flex:1, height:6, borderRadius:3 }} />
                          <Typography variant="caption" fontWeight={700}>{c.progress}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${c.grade}% (${gradeLabel(c.grade)})`} size="small"
                          color={gradeColor(c.grade)} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label={c.status} size="small"
                          color={c.status === 'Near Complete' ? 'success' : 'primary'} variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
