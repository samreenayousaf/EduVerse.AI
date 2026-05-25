const bcrypt  = require('bcryptjs');
const { db }  = require('../config/firebase');
const COLS    = require('../config/collections');
const { createNotification } = require('./notification.controller');
const Course  = require('../models/Course.model');

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const snap  = await db.collection(COLS.USERS).orderBy('createdAt', 'desc').get();
    const users = snap.docs.map(d => {
      const { password, ...u } = d.data();
      return { id: d.id, ...u };
    });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/instructors  ← NEW: returns only instructor-role users for dropdowns
exports.getInstructors = async (req, res) => {
  try {
    // BUG WAS: no such endpoint existed — frontend showed "No instructors found"
    const snap = await db
      .collection(COLS.USERS)
      .where('role', '==', 'instructor')   // filter by role field (correct field name)
      .where('isActive', '==', true)
      .get();

    if (snap.empty) {
      return res.json([]);                  // return empty array, not 404
    }

    const instructors = snap.docs.map(d => {
      const { password, ...u } = d.data();
      return { id: d.id, ...u };
    });
    res.json(instructors);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const snap = await db.collection(COLS.USERS).doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ message: 'User not found' });
    const updates = { updatedAt: new Date().toISOString() };
    if (req.body.name     !== undefined) updates.name     = req.body.name;
    if (req.body.role     !== undefined) updates.role     = req.body.role;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
    if (req.body.bio      !== undefined) updates.bio      = req.body.bio;
    if (req.body.newPassword) updates.password = await bcrypt.hash(req.body.newPassword, 12);
    await snap.ref.update(updates);
    if (req.body.isActive === false)
      await createNotification(req.params.id, { title: 'Account Deactivated', message: 'Your account was deactivated by admin.', type: 'error' });
    if (req.body.newPassword)
      await createNotification(req.params.id, { title: 'Password Reset', message: 'Admin reset your password.', type: 'warning' });
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' });
    await db.collection(COLS.USERS).doc(req.params.id).delete();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/courses
// BUG WAS: returned courses but Course model stores instructorId (string) not a ref,
// so no populate() needed — but instructorName is already embedded. Works correctly.
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 }).lean();
    // Return courses — instructorName is already a string field on the document
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/admin/courses/:id/status
exports.updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['published', 'draft', 'archived'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });
    const course = await Course.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Updated', course });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/admin/users/create-instructor
exports.createInstructor = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password required' });
    const existing = await db.collection(COLS.USERS).where('email', '==', email.toLowerCase()).get();
    if (!existing.empty) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const newUser = {
      name: name.trim(), email: email.toLowerCase(), password: hashed,
      role: 'instructor', isActive: true, bio: '', avatar: '',
      enrolledCourses: [], createdCourses: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    const ref = await db.collection(COLS.USERS).add(newUser);
    await createNotification(ref.id, {
      title: 'Welcome to EduVerse! 👋',
      message: `Hi ${name}, your instructor account has been created by admin.`,
      type: 'success',
    });
    res.status(201).json({ message: 'Instructor account created', id: ref.id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/admin/courses  ← NEW: admin creates a course and assigns it to an instructor
exports.adminCreateCourse = async (req, res) => {
  try {
    const { title, description, category, level, duration, price, tags,
            instructorId, instructorName } = req.body;

    if (!title || !description || !category)
      return res.status(400).json({ message: 'Title, description and category required' });
    if (!instructorId || !instructorName)
      return res.status(400).json({ message: 'Instructor must be selected' });

    // Verify instructor exists in Firebase
    const instructorSnap = await db.collection(COLS.USERS).doc(instructorId).get();
    if (!instructorSnap.exists)
      return res.status(404).json({ message: 'Instructor not found' });
    if (instructorSnap.data().role !== 'instructor' && instructorSnap.data().role !== 'admin')
      return res.status(400).json({ message: 'Selected user is not an instructor' });

    const defaultWeeks = [
      { title: 'General', weekNumber: 0, activities: [] },
      { title: 'Week 1',  weekNumber: 1, activities: [] },
      { title: 'Week 2',  weekNumber: 2, activities: [] },
      { title: 'Week 3',  weekNumber: 3, activities: [] },
    ];

    const course = await Course.create({
      title: title.trim(), description, category,
      level: level || 'Beginner', duration: duration || '',
      price: Number(price) || 0, tags: tags || [],
      instructorId,
      instructorName: instructorSnap.data().name || instructorName,
      status: 'published',
      weeks: defaultWeeks,
    });

    // Update instructor's createdCourses array in Firebase
    await db.collection(COLS.USERS).doc(instructorId).update({
      createdCourses: require('firebase-admin').firestore.FieldValue.arrayUnion(course._id.toString()),
    }).catch(() => {});

    res.status(201).json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/admin/courses/:id/assign-instructor
// Admin re-assigns a course to a different instructor
exports.assignInstructor = async (req, res) => {
  try {
    const { instructorId, instructorName } = req.body;
    if (!instructorId) return res.status(400).json({ message: 'instructorId required' });

    // Verify instructor exists in Firebase
    const snap = await db.collection(COLS.USERS).doc(instructorId).get();
    if (!snap.exists)
      return res.status(404).json({ message: 'Instructor not found' });
    if (!['instructor', 'admin'].includes(snap.data().role))
      return res.status(400).json({ message: 'Selected user is not an instructor' });

    const resolvedName = snap.data().name || instructorName;

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { instructorId, instructorName: resolvedName },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Update instructor's createdCourses in Firebase
    await db.collection(COLS.USERS).doc(instructorId).update({
      createdCourses: require('firebase-admin').firestore.FieldValue.arrayUnion(course._id.toString()),
    }).catch(() => {});

    res.json({ message: 'Instructor assigned', course });
  } catch (err) { res.status(500).json({ message: err.message }); }
};