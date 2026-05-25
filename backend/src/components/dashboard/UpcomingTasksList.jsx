import React from 'react';
import { Box, List, ListItem, Avatar, Typography, Chip } from '@mui/material';
import { Assignment, Quiz, Schedule } from '@mui/icons-material';
import { getDaysLeft, isOverdue } from '../../utils/helpers';

const ICON_MAP = { assignment: <Assignment />, quiz: <Quiz /> };

export default function UpcomingTasksList({ tasks = [] }) {
  if (!tasks.length) return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="body2" color="text.secondary">No upcoming tasks 🎉</Typography>
    </Box>
  );

  return (
    <List disablePadding>
      {tasks.map((task, i) => {
        const overdue = isOverdue(task.dueDate);
        const color   = task.color || '#1a237e';
        return (
          <ListItem key={i} disablePadding sx={{ mb: 1.5 }}>
            <Box sx={{
              display: 'flex', gap: 2, width: '100%',
              p: 1.5, borderRadius: 2,
              bgcolor: overdue ? '#b71c1c08' : `${color}08`,
              border: `1px solid ${overdue ? '#b71c1c20' : `${color}20`}`,
            }}>
              <Avatar sx={{ bgcolor: `${overdue ? '#b71c1c' : color}15`, width: 36, height: 36 }}>
                <Box sx={{ color: overdue ? '#b71c1c' : color, display: 'flex', fontSize: 18 }}>
                  {ICON_MAP[task.type] || <Assignment />}
                </Box>
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>{task.title}</Typography>
                <Typography variant="caption" color="text.secondary">{task.course}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                  <Schedule sx={{ fontSize: 12, color: overdue ? '#b71c1c' : color }} />
                  <Typography variant="caption" sx={{ color: overdue ? '#b71c1c' : color, fontWeight: 600 }}>
                    {getDaysLeft(task.dueDate)}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={task.type}
                size="small"
                sx={{ alignSelf: 'center', textTransform: 'capitalize', fontSize: '0.68rem',
                  bgcolor: `${color}12`, color }}
              />
            </Box>
          </ListItem>
        );
      })}
    </List>
  );
}
