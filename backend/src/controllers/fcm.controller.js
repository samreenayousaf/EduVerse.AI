const { admin, db } = require('../config/firebase');
const Enrollment    = require('../models/Enrollment.model');

// Save FCM token when user logs in from browser/app
exports.saveToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });
    await db.collection('users').doc(req.user.id).update({ fcmToken: token });
    res.json({ message: 'FCM token saved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Send notification to a single user
const sendToUser = async (userId, { title, body, link = '' }) => {
  try {
    const snap = await db.collection('users').doc(userId).get();
    const fcmToken = snap.data()?.fcmToken;
    if (!fcmToken) return;

    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      webpush: {
        notification: { title, body, icon: '/logo.png' },
        fcmOptions: { link: `http://localhost:3000${link}` },
      },
    });
  } catch (err) {
    console.warn(`FCM send failed for user ${userId}:`, err.message);
  }
};

// Send notification to all students enrolled in a course
const sendCourseNotification = async (courseId, { title, body }) => {
  try {
    const enrollments = await Enrollment.find({ courseId, status: 'active' }).lean();
    const promises = enrollments.map(e => sendToUser(e.studentId, { title, body, link: '/student/courses' }));
    await Promise.allSettled(promises);
    console.log(`FCM sent to ${enrollments.length} students`);
  } catch (err) {
    console.warn('sendCourseNotification error:', err.message);
  }
};

// Send assignment reminder FCM
const sendAssignmentFCM = async (courseId, { title, body }) => {
  return sendCourseNotification(courseId, { title, body });
};

// POST /api/fcm/token  — save token
exports.saveToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });
    await db.collection('users').doc(req.user.id).update({ fcmToken: token });
    res.json({ message: 'FCM token saved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  saveToken:              exports.saveToken,
  sendToUser,
  sendCourseNotification,
  sendAssignmentFCM,
};
