const Assignment = require('../models/Assignment.model');
const Quiz       = require('../models/Quiz.model');
const Course     = require('../models/Course.model');
const { createNotification } = require('../controllers/notification.controller');

const runReminders = async () => {
  const now   = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  console.log('⏰ Running deadline reminders...');
  try {
    // Assignment reminders
    const assignments = await Assignment.find({ dueDate: { $gte: now, $lte: in24h } }).lean();
    for (const a of assignments) {
      const submittedIds = a.submissions.map(s => s.studentId);
      const course = await Course.findById(a.courseId).select('enrolledStudents').lean();
      if (!course) continue;
      const notSubmitted = (course.enrolledStudents || []).filter(id => !submittedIds.includes(id));
      const hoursLeft    = Math.round((new Date(a.dueDate) - now) / (1000 * 60 * 60));
      for (const studentId of notSubmitted) {
        await createNotification(studentId, {
          title:   `⏰ Reminder: "${a.title}" due soon!`,
          message: `Only ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} left to submit. Don't miss the deadline!`,
          type:    'warning',
          link:    '/student/assignments',
        }).catch(() => {});
      }
    }
    // Quiz reminders
    const quizzes = await Quiz.find({ dueDate: { $gte: now, $lte: in24h } }).lean();
    for (const q of quizzes) {
      const attemptedIds = q.attempts.map(a => a.studentId);
      const course = await Course.findById(q.courseId).select('enrolledStudents').lean();
      if (!course) continue;
      const notAttempted = (course.enrolledStudents || []).filter(id => !attemptedIds.includes(id));
      const hoursLeft    = Math.round((new Date(q.dueDate) - now) / (1000 * 60 * 60));
      for (const studentId of notAttempted) {
        await createNotification(studentId, {
          title:   `⏰ Reminder: "${q.title}" closes soon!`,
          message: `Only ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} left to attempt this quiz!`,
          type:    'warning',
          link:    '/student/quizzes',
        }).catch(() => {});
      }
    }
    console.log('✅ Deadline reminders done.');
  } catch (err) {
    console.error('❌ Reminder job error:', err.message);
  }
};

const scheduleDeadlineReminders = () => {
  runReminders();
  setInterval(runReminders, 6 * 60 * 60 * 1000); // every 6 hours
};

module.exports = { scheduleDeadlineReminders, runReminders };
