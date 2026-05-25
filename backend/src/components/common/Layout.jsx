import React, { useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Avatar,
  Menu, MenuItem, Divider, Tooltip, Button,
  Drawer, List, ListItemButton, ListItemText,
  useMediaQuery, useTheme,
} from '@mui/material';
import {
  School, Dashboard, MenuBook, Assignment, Quiz, TrendingUp,
  Notifications, Person, Logout, WbSunny, DarkMode,
  Menu as MenuIcon, CalendarMonth, People, BarChart,
  Settings, Analytics,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';

// STUDENT: no Library
const studentNav = [
  { label: 'Dashboard',   path: '/student/dashboard'   },
  { label: 'My Courses',  path: '/student/courses'     },
  { label: 'Assignments', path: '/student/assignments' },
  { label: 'Quizzes',     path: '/student/quizzes'     },
  { label: 'Progress',    path: '/student/progress'    },
];

// INSTRUCTOR: Dashboard rakha, Home hata diya
const instructorNav = [
  { label: 'Dashboard',  path: '/instructor/dashboard'    },
  { label: 'My Courses', path: '/instructor/courses'      },
  { label: 'Assignments',path: '/instructor/assignments'  },
  { label: 'Quizzes',    path: '/instructor/quizzes'      },
  { label: 'Analytics',  path: '/instructor/analytics'    },
];

const adminNav = [
  { label: 'Dashboard',  path: '/admin/dashboard'  },
  { label: 'Users',      path: '/admin/users'       },
  { label: 'Courses',    path: '/admin/courses'     },
  { label: 'Analytics',  path: '/admin/analytics'  },
  { label: 'Settings',   path: '/admin/settings'   },
];

export default function Layout({ children }) {
  const { user, logout }     = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate             = useNavigate();
  const location             = useLocation();
  const muiTheme             = useTheme();
  const isMobile             = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isDark               = mode === 'dark';

  const [anchorEl,   setAnchorEl]   = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const surface = isDark ? '#1F2937' : '#FFFFFF';
  const border  = isDark ? '#374151' : '#E5E7EB';
  const txt     = isDark ? '#F9FAFB' : '#111827';
  const sub     = isDark ? '#9CA3AF' : '#6B7280';
  const hover   = isDark ? '#374151' : '#F3F4F6';
  const bg      = isDark ? '#111827' : '#F9FAFB';

  const navItems = user?.role === 'instructor' ? instructorNav
    : user?.role === 'admin' ? adminNav
    : studentNav;

  const handleLogout = () => { logout(); navigate('/login'); setAnchorEl(null); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: bg }}>

      {/* Top AppBar */}
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: surface, borderBottom: `1px solid ${border}`, zIndex: 100,
      }}>
        <Toolbar sx={{ px: { xs: 2, md: 4 }, minHeight: '60px !important', gap: 2 }}>

          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: { md: 3 } }}>
            {isMobile && (
              <IconButton size="small" onClick={() => setMobileOpen(true)} sx={{ color: sub, mr: 0.5 }}>
                <MenuIcon fontSize="small" />
              </IconButton>
            )}
            <Box sx={{ width: 28, height: 28, borderRadius: 1.5,
              bgcolor: isDark ? '#374151' : '#111827',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <School sx={{ color: '#fff', fontSize: 16 }} />
            </Box>
            <Typography fontWeight={800} sx={{ color: txt, fontSize: '0.95rem', letterSpacing: '-0.3px' }}>
              EduVerse
            </Typography>
          </Box>

          {/* Nav links — desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
              {navItems.map(item => {
                const active = location.pathname === item.path ||
                  (item.path !== '/student/dashboard' && item.path !== '/instructor/courses' && location.pathname.startsWith(item.path));
                return (
                  <Button key={item.label} onClick={() => navigate(item.path)}
                    sx={{
                      px: 1.5, py: 0.6, fontWeight: active ? 700 : 500,
                      fontSize: '0.835rem', textTransform: 'none', minWidth: 'auto',
                      color: active ? txt : sub,
                      borderBottom: active ? `2px solid ${txt}` : '2px solid transparent',
                      borderRadius: 0,
                      '&:hover': { color: txt, bgcolor: 'transparent' },
                    }}>
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          )}
          {isMobile && <Box sx={{ flex: 1 }} />}

          {/* Right actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
              <IconButton size="small" onClick={toggleMode}
                sx={{ color: sub, bgcolor: hover, borderRadius: 2, '&:hover':{ bgcolor: border } }}>
                {isDark ? <WbSunny fontSize="small" /> : <DarkMode fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Box sx={{
              '& button': { color: sub, bgcolor: hover, borderRadius: 2,
                '&:hover':{ bgcolor: border } }
            }}>
              <NotificationBell />
            </Box>

            <Box onClick={e => setAnchorEl(e.currentTarget)}
              sx={{ display:'flex', alignItems:'center', gap:1, cursor:'pointer',
                px:1, py:0.5, borderRadius:2, bgcolor:hover,
                '&:hover':{ bgcolor:border }, ml:0.5 }}>
              <Avatar sx={{ width:28, height:28, bgcolor: isDark?'#374151':'#1F2937',
                fontSize:11, fontWeight:700, color:'#fff' }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="body2" fontWeight={600}
                sx={{ color:txt, display:{ xs:'none', sm:'block' }, fontSize:'0.8rem' }}>
                {user?.name?.split(' ')[0]}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Dropdown */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ sx:{ mt:1, minWidth:200, borderRadius:2,
          border:`1px solid ${border}`, bgcolor:surface,
          boxShadow: isDark?'0 8px 32px rgba(0,0,0,0.5)':'0 8px 32px rgba(0,0,0,0.1)' } }}>
        <Box sx={{ px:2, py:1.5, borderBottom:`1px solid ${border}` }}>
          <Typography variant="body2" fontWeight={700} sx={{ color:txt }}>{user?.name}</Typography>
          <Typography variant="caption" sx={{ color:sub }}>{user?.email}</Typography>
        </Box>
        <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}
          sx={{ gap:1.5, py:1, color:sub, '&:hover':{ bgcolor:hover, color:txt } }}>
          <Person fontSize="small" />
          <Typography variant="body2" fontWeight={500}>Profile</Typography>
        </MenuItem>
        <Divider sx={{ borderColor:border }} />
        <MenuItem onClick={handleLogout}
          sx={{ gap:1.5, py:1, color:'#EF4444', '&:hover':{ bgcolor: isDark?'#3f1515':'#FEF2F2' } }}>
          <Logout fontSize="small" />
          <Typography variant="body2" fontWeight={600}>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}
        PaperProps={{ sx:{ bgcolor:surface, width:240 } }}>
        <Box sx={{ p:2, borderBottom:`1px solid ${border}` }}>
          <Typography fontWeight={800} sx={{ color:txt }}>EduVerse</Typography>
        </Box>
        <List sx={{ px:1, pt:1 }}>
          {navItems.map(item => (
            <ListItemButton key={item.label}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{ borderRadius:2, mb:0.5,
                bgcolor: location.pathname === item.path ? hover : 'transparent' }}>
              <ListItemText primary={item.label}
                primaryTypographyProps={{ fontSize:'0.875rem', fontWeight:600, color:txt }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Page Content */}
      <Box sx={{ flex:1, px:{ xs:2, md:4 }, py:3, maxWidth:1400, mx:'auto', width:'100%' }}>
        {children}
      </Box>
    </Box>
  );
}