import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';

export default function StatCard({ title, value, icon, trend, color }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const bg     = isDark ? '#1F2937' : '#FFFFFF';
  const border = isDark ? '#374151' : '#E5E7EB';
  const txt    = isDark ? '#F9FAFB' : '#111827';
  const sub    = isDark ? '#9CA3AF' : '#6B7280';
  const iconBg = isDark ? '#374151' : '#F3F4F6';

  return (
    <Card sx={{ bgcolor: bg, border: `1px solid ${border}`, boxShadow: 'none', borderRadius: 3 }}>
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#9CA3AF' : '#374151' }}>
            {icon}
          </Box>
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, px: 1, py: 0.3, borderRadius: 1,
              bgcolor: trend >= 0 ? (isDark ? '#14532d20' : '#F0FDF4') : (isDark ? '#7f1d1d20' : '#FEF2F2') }}>
              {trend >= 0
                ? <TrendingUp sx={{ fontSize: 12, color: '#16A34A' }} />
                : <TrendingDown sx={{ fontSize: 12, color: '#DC2626' }} />}
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: trend >= 0 ? '#16A34A' : '#DC2626' }}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h4" fontWeight={800} sx={{ color: txt, lineHeight: 1, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: sub, fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
    </Card>
  );
}