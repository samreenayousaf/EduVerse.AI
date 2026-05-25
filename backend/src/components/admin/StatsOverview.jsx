import React from 'react';
import { Grid } from '@mui/material';
import { People, School, AccountBalance, TrendingUp } from '@mui/icons-material';
import StatCard from '../common/StatCard';

export default function StatsOverview({ stats = {} }) {
  const cards = [
    { title: 'Total Users',     value: stats.totalUsers    || '—', icon: <People />,         color: '#b71c1c', trend: stats.userGrowth },
    { title: 'Active Courses',  value: stats.totalCourses  || '—', icon: <School />,         color: '#1a237e', trend: stats.courseGrowth },
    { title: 'Monthly Revenue', value: stats.revenue       || '—', icon: <AccountBalance />, color: '#00897b', trend: stats.revenueGrowth },
    { title: 'Platform Growth', value: stats.growth        || '—', icon: <TrendingUp />,     color: '#e65100' },
  ];
  return (
    <Grid container spacing={3}>
      {cards.map((c, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}><StatCard {...c} /></Grid>
      ))}
    </Grid>
  );
}
