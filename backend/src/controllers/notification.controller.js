const { db, admin } = require('../config/firebase');
const COLS = require('../config/collections');

// Create notification helper (used internally)
const createNotification = async (userId, data) => {
  await db.collection('notifications').add({
    userId,
    title:   data.title,
    message: data.message,
    type:    data.type || 'info',  // info | success | warning | error
    read:    false,
    link:    data.link || '',
    createdAt: new Date().toISOString(),
  });
};

// GET /api/notifications  — get my notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const snap = await db.collection('notifications')
      .where('userId', '==', req.user.id)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();
    const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(notifs);
  } catch (err) {
    console.error('getMyNotifications error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    await db.collection('notifications').doc(req.params.id).update({ read: true });
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    const snap = await db.collection('notifications')
      .where('userId', '==', req.user.id)
      .where('read', '==', false).get();
    const batch = db.batch();
    snap.docs.forEach(d => batch.update(d.ref, { read: true }));
    await batch.commit();
    res.json({ message: 'All marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    await db.collection('notifications').doc(req.params.id).delete();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports.createNotification = createNotification;