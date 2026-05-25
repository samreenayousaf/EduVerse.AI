import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton, Badge, Popover, Box, Typography, List, ListItem,
  Button, Chip, Divider, CircularProgress,
} from '@mui/material';
import {
  Notifications, NotificationsNone, DoneAll, Delete,
  CheckCircle, Info, Warning, Error,
} from '@mui/icons-material';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TYPE_CONFIG = {
  success: { color: '#00897b', bg: '#E8F5E9', Icon: CheckCircle },
  info:    { color: '#1a237e', bg: '#E8EAF6', Icon: Info        },
  warning: { color: '#e65100', bg: '#FFF3E0', Icon: Warning      },
  error:   { color: '#b71c1c', bg: '#FFEBEE', Icon: Error        },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [anchorEl,  setAnchorEl]  = useState(null);
  const [notifs,    setNotifs]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const intervalRef = useRef(null);

  const token = () => localStorage.getItem('ev_token');

  const fetchNotifs = async (showLoader = false) => {
    if (!token()) return;
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setNotifs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Notification fetch failed:', err?.response?.data || err.message);
      setError('Could not load notifications');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Poll every 15 seconds
  useEffect(() => {
    fetchNotifs(true);
    intervalRef.current = setInterval(() => fetchNotifs(false), 15000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  const markRead = async (id) => {
    try {
      await axios.put(`${BASE_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('markRead failed:', err?.response?.data || err.message);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${BASE_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('markAllRead failed:', err?.response?.data || err.message);
    }
  };

  const deleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`${BASE_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setNotifs(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('deleteNotif failed:', err?.response?.data || err.message);
    }
  };

  const handleOpen  = (e) => { setAnchorEl(e.currentTarget); fetchNotifs(true); };
  const handleClose = ()  => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={handleOpen} size="small">
        <Badge badgeContent={unread || null} color="error" max={9}>
          {unread > 0
            ? <Notifications sx={{ fontSize: 20 }}/>
            : <NotificationsNone sx={{ fontSize: 20 }}/>
          }
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: {
          width: 380, borderRadius: 3,
          boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
          mt: 1, border: '1px solid #E5E7EB',
        }}}
      >
        {/* Header */}
        <Box sx={{ px: 2.5, py: 1.8, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: '1px solid #F0F0F0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
            {unread > 0 && (
              <Chip label={unread} size="small" color="error"
                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}/>
            )}
          </Box>
          {unread > 0 && (
            <Button size="small" startIcon={<DoneAll sx={{ fontSize: 14 }}/>}
              onClick={markAllRead}
              sx={{ fontSize: '0.72rem', color: '#6B7280', '&:hover': { color: '#111827' } }}>
              Mark all read
            </Button>
          )}
        </Box>

        {/* List */}
        <Box sx={{ maxHeight: 440, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ py: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={28} />
            </Box>
          ) : error ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="body2" color="error" fontWeight={500}>{error}</Typography>
              <Button size="small" onClick={() => fetchNotifs(true)} sx={{ mt: 1 }}>
                Retry
              </Button>
            </Box>
          ) : notifs.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <NotificationsNone sx={{ fontSize: 44, color: '#D1D5DB', mb: 1.5 }}/>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                You're all caught up!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifs.map((n, idx) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                const Icon = cfg.Icon;
                return (
                  <React.Fragment key={n.id}>
                    <ListItem
                      onClick={() => { if (!n.read) markRead(n.id); }}
                      sx={{
                        px: 2, py: 1.5, cursor: !n.read ? 'pointer' : 'default',
                        bgcolor: n.read ? 'transparent' : `${cfg.bg}88`,
                        alignItems: 'flex-start', gap: 1.5,
                        '&:hover': { bgcolor: '#F9FAFB' },
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Icon circle */}
                      <Box sx={{
                        width: 36, height: 36, borderRadius: '50%',
                        bgcolor: cfg.bg, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.2,
                      }}>
                        <Icon sx={{ fontSize: 18, color: cfg.color }}/>
                      </Box>

                      {/* Text */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={n.read ? 500 : 700}
                          sx={{ lineHeight: 1.4, mb: 0.3 }}>
                          {n.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary"
                          sx={{ display: 'block', lineHeight: 1.4, mb: 0.5 }}>
                          {n.message}
                        </Typography>
                        <Typography variant="caption"
                          sx={{ color: cfg.color, fontSize: '0.65rem', fontWeight: 500 }}>
                          {timeAgo(n.createdAt)}
                        </Typography>
                      </Box>

                      {/* Delete */}
                      <IconButton size="small" onClick={(e) => deleteNotif(e, n.id)}
                        sx={{ opacity: 0, '.MuiListItem-root:hover &': { opacity: 1 },
                          color: '#9CA3AF', '&:hover': { color: '#EF4444' }, mt: -0.5, mr: -0.5 }}>
                        <Delete sx={{ fontSize: 15 }}/>
                      </IconButton>

                      {/* Unread dot */}
                      {!n.read && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%',
                          bgcolor: cfg.color, flexShrink: 0, mt: 0.8 }}/>
                      )}
                    </ListItem>
                    {idx < notifs.length - 1 && <Divider sx={{ mx: 2 }}/>}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notifs.length > 0 && !loading && (
          <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #F0F0F0', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {notifs.length} notification{notifs.length !== 1 ? 's' : ''} · updates every 15 seconds
            </Typography>
          </Box>
        )}
      </Popover>
    </>
  );
}