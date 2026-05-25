require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const errorHandler   = require('./middleware/errorHandler');
const connectMongoDB = require('./config/mongodb');

// Init Firebase first
require('./config/firebase');

// Connect MongoDB Atlas
connectMongoDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/fcm',           require('./routes/fcmRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));
app.use('/api/timeline',      require('./routes/timelineRoutes'));

app.use('/api/courses',       require('./routes/courseRoutes'));
app.use('/api/enrollments',   require('./routes/enrollmentRoutes'));
app.use('/api/assignments',   require('./routes/assignmentRoutes'));
app.use('/api/quizzes',       require('./routes/quizRoutes'));
app.use('/api/analytics',     require('./routes/analyticsRoutes'));
app.use('/api/ai',            require('./routes/aiRoutes'));
app.use('/api',               require('./routes/announcementRoutes'));

// ── Health Check ──────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({
  status:    'ok',
  platform:  'EduVerse.AI v3.1',
  firebase:  'Auth + Notifications + FCM',
  mongodb:   'Courses + Quizzes + Progress',
  timestamp: new Date().toISOString(),
}));

app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// ── Deadline Reminder Job (runs every 6 hours) ────────────────────────
try {
  const { scheduleDeadlineReminders } = require('./jobs/deadlineReminder');
  scheduleDeadlineReminders();
} catch (e) {
  console.warn('⚠️  Deadline reminder job not loaded:', e.message);
}

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════════╗');
  console.log('  ║        EduVerse.AI API  ·  v3.1.0               ║');
  console.log(`  ║        http://localhost:${PORT}                   ║`);
  console.log('  ║   🔥 Firebase  → Auth, Notifications, FCM       ║');
  console.log('  ║   🍃 MongoDB   → Courses, Quizzes, Progress     ║');
  console.log('  ╚══════════════════════════════════════════════════╝');
  console.log('');
});