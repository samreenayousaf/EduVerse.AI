import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon, School } from '@mui/icons-material';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DRAWER_WIDTH = 260;

const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isMobile ? (
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} variant="temporary" />
      ) : (
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0, mt: '68px' }}>
          <Box sx={{ position: 'fixed', top: 68, left: 0, height: 'calc(100vh - 68px)', width: DRAWER_WIDTH, overflowY: 'auto' }}>
            <Sidebar variant="permanent" />
          </Box>
        </Box>
      )}

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {isMobile ? (
          <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #E2E8F0' }}>
            <Toolbar>
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School color="primary" />
                <Typography variant="h6" fontWeight={800} color="primary">EduVerse.AI</Typography>
              </Box>
            </Toolbar>
          </AppBar>
        ) : (
          <Navbar />
        )}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, maxWidth: 1400 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
