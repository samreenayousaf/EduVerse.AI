import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

export default function ProgressChart({ data = [], color = '#1a237e', title = 'Weekly Performance', label = 'This Week' }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        <Chip label={label} size="small" color="primary" variant="outlined" />
      </Box>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={v => `${v}%`} />
          <Tooltip formatter={v => [`${v}%`, 'Score']} />
          <Area
            type="monotone" dataKey="score" stroke={color} strokeWidth={2.5}
            fill={`url(#grad-${color.replace('#', '')})`}
            dot={{ fill: color, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
