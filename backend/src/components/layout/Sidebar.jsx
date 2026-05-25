import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Chip, Avatar, Divider } from '@mui/material';
import { Dashboard, MenuBook, Assignment, Quiz, Analytics, People, Settings, School, TrendingUp } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

const studentNav = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/student/dashboard' },
  { label: 'My Courses', icon: <MenuBook />, path: '/student/courses' },
  { label: 'Assignments', icon: <Assignment />, path: '/student/assignments' },
  { label: 'Quizzes', icon: <Quiz />, path: '/student/quizzes' },
  { label: 'Progress', icon: <TrendingUp />, path: '/student/progress' },
];

const instructorNav = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/instructor/dashboard' },
  { label: 'My Courses', icon: <MenuBook />, path: '/instructor/courses' },
  { label: 'Assignments', icon: <Assignment />, path: '/instructor/assignments' },
  { label: 'Quizzes', icon: <Quiz />, path: '/instructor/quizzes' },
  { label: 'Analytics', icon: <Analytics />, path: '/instructor/analytics' },
];

const adminNav = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
  { label: 'Users', icon: <People />, path: '/admin/users' },
  { label: 'Courses', icon: <School />, path: '/admin/courses' },
  { label: 'Analytics', icon: <Analytics />, path: '/admin/analytics' },
  { label: 'Settings', icon: <Settings />, path: '/admin/settings' },
];

const navMap = { student: studentNav, instructor: instructorNav, admin: adminNav };

const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = navMap[user?.role] || studentNav;

  const content = (
    <Box sx={{ width: DRAWER_WIDTH, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Info */}
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)', borderBottom: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={user?.avatar} sx={{ width: 44, height: 44, bgcolor: 'primary.main', fontWeight: 700 }}>
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700} noWrap>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            <Box mt={0.3}><Chip label={user?.role} size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} /></Box>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => { navigate(item.path); if (onClose) onClose(); }}
              sx={{
                borderRadius: 2, mb: 0.5, px: 2,
                bgcolor: active ? 'primary.main' : 'transparent',
                color: active ? 'white' : 'text.secondary',
                '&:hover': { bgcolor: active ? 'primary.dark' : '#F1F5F9', color: active ? 'white' : 'primary.main' },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: '0.875rem' }} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.disabled">EduVerse.AI v1.0.0</Typography>
      </Box>
    </Box>
  );

  if (variant === 'temporary') {
    return <Drawer open={open} onClose={onClose} variant="temporary">{content}</Drawer>;
  }

  return (
    <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none', borderRight: '1px solid #E2E8F0' } }}>
      {content}
    </Drawer>
  );
};

export default Sidebar;
