import React, { useState } from 'react';
import {
  AppBar, Toolbar, Box, Button, IconButton, Avatar, Menu, MenuItem,
  Typography, Divider, useMediaQuery, Drawer, List, ListItem,
  ListItemIcon, ListItemText, ListItemButton, Badge, Chip,
} from '@mui/material';
import {
  AutoStories, Menu as MenuIcon, Dashboard, School, Assignment,
  Quiz, Person, Logout, AdminPanelSettings, Add, Close,
  Notifications,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { label: 'Courses', to: '/courses' },
];

const DASHBOARD_LINKS = (role) => [
  { label: 'Dashboard', to: '/dashboard', icon: <Dashboard /> },
  { label: 'My Courses', to: '/courses', icon: <School /> },
  { label: 'Assignments', to: '/assignments', icon: <Assignment /> },
  { label: 'Quizzes', to: '/quizzes', icon: <Quiz /> },
  ...(role === 'instructor' || role === 'admin'
    ? [{ label: 'Create Course', to: '/courses/create', icon: <Add /> }]
    : []),
  ...(role === 'admin'
    ? [{ label: 'Admin Panel', to: '/admin', icon: <AdminPanelSettings /> }]
    : []),
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setAnchorEl(null);
  };

  const roleColor = {
    admin: 'error',
    instructor: 'secondary',
    student: 'primary',
  }[user?.role] || 'primary';

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 4 } }}>
          {/* Logo */}
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', mr: 4 }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: 2,
              background: 'linear-gradient(135deg, #0F4C81, #00B4D8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AutoStories sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: 'primary.main', letterSpacing: '-0.02em' }}>
              EduVerse<Typography component="span" variant="h6" fontWeight={800} sx={{ color: 'secondary.main' }}>.AI</Typography>
            </Typography>
          </Box>

          {/* Desktop Nav */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.to}
                  component={Link}
                  to={link.to}
                  sx={{
                    color: location.pathname === link.to ? 'primary.main' : 'text.secondary',
                    backgroundColor: location.pathname === link.to ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
                    fontWeight: 600,
                  }}
                >
                  {link.label}
                </Button>
              ))}
              {isAuthenticated && DASHBOARD_LINKS(user?.role).map((link) => (
                <Button
                  key={link.to}
                  component={Link}
                  to={link.to}
                  sx={{
                    color: location.pathname.startsWith(link.to) ? 'primary.main' : 'text.secondary',
                    backgroundColor: location.pathname.startsWith(link.to) ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
                    fontWeight: 600,
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>
                <IconButton size="small">
                  <Badge badgeContent={2} color="error">
                    <Notifications fontSize="small" />
                  </Badge>
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                  onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <Avatar
                    src={user?.avatar}
                    sx={{ width: 34, height: 34, fontSize: '0.875rem', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #0F4C81, #00B4D8)' }}
                  >
                    {user?.name?.[0]?.toUpperCase()}
                  </Avatar>
                  {!isMobile && (
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>{user?.name}</Typography>
                      <Chip label={user?.role} size="small" color={roleColor} sx={{ height: 16, fontSize: '0.6rem' }} />
                    </Box>
                  )}
                </Box>

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                  PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2, border: '1px solid', borderColor: 'divider' } }}>
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                  </Box>
                  <Divider />
                  <MenuItem component={Link} to="/profile" onClick={() => setAnchorEl(null)}>
                    <Person fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} /> Profile
                  </MenuItem>
                  <MenuItem component={Link} to="/dashboard" onClick={() => setAnchorEl(null)}>
                    <Dashboard fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} /> Dashboard
                  </MenuItem>
                  {user?.role === 'admin' && (
                    <MenuItem component={Link} to="/admin" onClick={() => setAnchorEl(null)}>
                      <AdminPanelSettings fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} /> Admin Panel
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <Logout fontSize="small" sx={{ mr: 1.5 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" variant="outlined" size="small">Sign In</Button>
                <Button component={Link} to="/register" variant="contained" size="small">Get Started</Button>
              </>
            )}
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ ml: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: 280 } }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={800}>EduVerse.AI</Typography>
          <IconButton onClick={() => setMobileOpen(false)}><Close /></IconButton>
        </Box>
        <Divider />
        <List>
          {(isAuthenticated ? DASHBOARD_LINKS(user?.role) : NAV_LINKS).map((link) => (
            <ListItem key={link.to} disablePadding>
              <ListItemButton component={Link} to={link.to} onClick={() => setMobileOpen(false)}
                selected={location.pathname.startsWith(link.to)}>
                {link.icon && <ListItemIcon sx={{ minWidth: 36 }}>{link.icon}</ListItemIcon>}
                <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
