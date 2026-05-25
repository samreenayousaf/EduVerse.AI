import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar, Box, IconButton, Menu, MenuItem, Chip, Divider, Badge } from '@mui/material';
import { School, Notifications, KeyboardArrowDown, Dashboard, Logout, Person, MenuBook } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleColors = { student: 'primary', instructor: 'secondary', admin: 'error' };

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const getDashboardPath = () => user ? `/${user.role}/dashboard` : '/';

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, md: 4 }, height: 68 }}>
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', mr: 4 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <School sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EduVerse.AI
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexGrow: 1 }}>
          <Button component={Link} to="/courses" color="inherit" sx={{ color: 'text.secondary' }} startIcon={<MenuBook />}>Courses</Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user ? (
            <>
              <IconButton size="small"><Badge badgeContent={3} color="error"><Notifications sx={{ color: 'text.secondary' }} /></Badge></IconButton>
              <Box onClick={handleMenu} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', px: 1.5, py: 0.75, borderRadius: 3, '&:hover': { bgcolor: '#F1F5F9' } }}>
                <Avatar src={user.avatar} sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 700 }}>
                  {user.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" fontWeight={600} lineHeight={1.2}>{user.name}</Typography>
                  <Chip label={user.role} size="small" color={roleColors[user.role]} sx={{ height: 16, fontSize: '0.6rem', mt: 0.2 }} />
                </Box>
                <KeyboardArrowDown sx={{ color: 'text.secondary', fontSize: 18 }} />
              </Box>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 3, border: '1px solid #E2E8F0' } }}>
                <MenuItem onClick={() => { navigate(getDashboardPath()); handleClose(); }} sx={{ gap: 1.5, py: 1.2 }}>
                  <Dashboard fontSize="small" color="primary" /> Dashboard
                </MenuItem>
                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }} sx={{ gap: 1.5, py: 1.2 }}>
                  <Person fontSize="small" /> Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { logout(); handleClose(); }} sx={{ gap: 1.5, py: 1.2, color: 'error.main' }}>
                  <Logout fontSize="small" /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" variant="outlined" size="small">Login</Button>
              <Button component={Link} to="/register" variant="contained" size="small">Get Started</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
