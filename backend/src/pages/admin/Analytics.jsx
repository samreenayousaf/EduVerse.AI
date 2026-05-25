import React, { useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';

import {
  People,
  School,
  TrendingUp,
  AccountBalance,
} from '@mui/icons-material';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { analyticsAPI } from '../../services/api';

export default function AdminAnalytics() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    analyticsAPI.admin()
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load analytics data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader
          title="Platform Analytics"
          subtitle="Comprehensive performance overview"
        />
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const {
    totalRevenue = 0,
    totalUsers = 0,
    totalCourses = 0,
    growthRate = 0,
    activeUsers = 0,
    userGrowth = [],
    revenueData = [],
    catData = [],
    planData = [],
  } = data || {};

  return (
    <Box>

      <PageHeader
        title="Platform Analytics"
        subtitle="Comprehensive performance overview"
      />

      {/* ===== Stats ===== */}

      <Grid container spacing={3} sx={{ mb:4 }}>

        {[
          {
            title:'Total Revenue',
            value:`$${totalRevenue.toLocaleString()}`,
            icon:<AccountBalance />,
            color:'#b71c1c',
            trend:growthRate,
          },

          {
            title:'Total Users',
            value:String(totalUsers),
            icon:<People />,
            color:'#1a237e',
            trend:growthRate,
          },

          {
            title:'Total Courses',
            value:String(totalCourses),
            icon:<School />,
            color:'#4a148c',
            trend:0,
          },

          {
            title:'Active Users',
            value:String(activeUsers),
            icon:<TrendingUp />,
            color:'#00897b',
            trend:growthRate,
          },

        ].map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCard {...s} />
          </Grid>
        ))}

      </Grid>

      {/* ===== Charts ===== */}

      <Grid container spacing={3}>

        {/* ===== User Growth ===== */}

        <Grid item xs={12} md={8}>
          <Card>

            <CardContent sx={{ p:3 }}>

              <Box
                sx={{
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center',
                  mb:3,
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  User Growth
                </Typography>

                <Chip
                  label="Last 6 months"
                  size="small"
                  variant="outlined"
                />
              </Box>

              {userGrowth.length > 0 ? (

                <ResponsiveContainer width="100%" height={220}>

                  <AreaChart data={userGrowth}>

                    <defs>
                      <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#b71c1c"
                          stopOpacity={0.3}
                        />

                        <stop
                          offset="95%"
                          stopColor="#b71c1c"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize:12 }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize:12 }}
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#b71c1c"
                      strokeWidth={2.5}
                      fill="url(#ug)"
                      dot={{ fill:'#b71c1c', r:4 }}
                    />

                  </AreaChart>

                </ResponsiveContainer>

              ) : (

                <Box
                  sx={{
                    height:220,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No user growth data available
                  </Typography>
                </Box>

              )}

            </CardContent>

          </Card>
        </Grid>

        {/* ===== Subscription Plans ===== */}

        <Grid item xs={12} md={4}>
          <Card sx={{ height:'100%' }}>

            <CardContent sx={{ p:3 }}>

              <Typography variant="h6" fontWeight={700} gutterBottom>
                Subscription Plans
              </Typography>

              {planData.length > 0 ? (

                <>
                  <ResponsiveContainer width="100%" height={160}>

                    <PieChart>

                      <Pie
                        data={planData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {planData.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>

                      <Tooltip />

                    </PieChart>

                  </ResponsiveContainer>

                  {planData.map((p, i) => (

                    <Box
                      key={i}
                      sx={{
                        display:'flex',
                        justifyContent:'space-between',
                        mt:1,
                      }}
                    >

                      <Box
                        sx={{
                          display:'flex',
                          alignItems:'center',
                          gap:1,
                        }}
                      >

                        <Box
                          sx={{
                            width:10,
                            height:10,
                            borderRadius:'50%',
                            bgcolor:p.color,
                          }}
                        />

                        <Typography variant="caption">
                          {p.name}
                        </Typography>

                      </Box>

                      <Typography variant="caption" fontWeight={700}>
                        {p.value}
                      </Typography>

                    </Box>

                  ))}

                </>

              ) : (

                <Box
                  sx={{
                    height:200,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No subscription data available
                  </Typography>
                </Box>

              )}

            </CardContent>

          </Card>
        </Grid>

        {/* ===== Students By Category ===== */}

        <Grid item xs={12} md={5}>
          <Card>

            <CardContent sx={{ p:3 }}>

              <Typography variant="h6" fontWeight={700} gutterBottom>
                Students by Category
              </Typography>

              {catData.length > 0 ? (

                <ResponsiveContainer width="100%" height={220}>

                  <BarChart data={catData} layout="vertical">

                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize:11 }}
                    />

                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize:11 }}
                      width={90}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="students"
                      fill="#b71c1c"
                      radius={[0,6,6,0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              ) : (

                <Box
                  sx={{
                    height:220,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No category analytics available
                  </Typography>
                </Box>

              )}

            </CardContent>

          </Card>
        </Grid>

        {/* ===== Revenue ===== */}

        <Grid item xs={12} md={7}>
          <Card>

            <CardContent sx={{ p:3 }}>

              <Typography variant="h6" fontWeight={700} gutterBottom>
                Monthly Revenue
              </Typography>

              {revenueData.length > 0 ? (

                <ResponsiveContainer width="100%" height={220}>

                  <BarChart data={revenueData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize:12 }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize:12 }}
                      tickFormatter={(v) => `$${v / 1000}k`}
                    />

                    <Tooltip
                      formatter={(v) => [
                        `$${v.toLocaleString()}`,
                        'Revenue',
                      ]}
                    />

                    <Bar
                      dataKey="revenue"
                      fill="#b71c1c"
                      radius={[6,6,0,0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              ) : (

                <Box
                  sx={{
                    height:220,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No revenue data available
                  </Typography>
                </Box>

              )}

            </CardContent>

          </Card>
        </Grid>

      </Grid>

    </Box>
  );
}