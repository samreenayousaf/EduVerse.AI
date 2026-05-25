const express = require('express');
const router  = express.Router();
const {
  getUsers, updateUser, deleteUser,
  getAllCourses, updateCourseStatus,
  createInstructor, getInstructors,
  adminCreateCourse, assignInstructor,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

// ── User management ───────────────────────────────────────────────────
router.get('/users',                    getUsers);
router.put('/users/:id',                updateUser);
router.delete('/users/:id',             deleteUser);
router.post('/users/create-instructor', createInstructor);

// ── Instructor list for dropdowns ─────────────────────────────────────
router.get('/instructors',              getInstructors);

// ── Course management ─────────────────────────────────────────────────
router.get('/courses',                  getAllCourses);
router.post('/courses',                 adminCreateCourse);
router.put('/courses/:id/status',       updateCourseStatus);
router.put('/courses/:id/assign-instructor', assignInstructor);   // ← re-assign

module.exports = router;