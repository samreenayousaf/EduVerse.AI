const express = require('express');
const router  = express.Router();
const { enroll, getMyEnrollments, updateProgress, getByCourse } = require('../controllers/enrollment.controller');
const { protect, authorize } = require('../middleware/auth');

router.post('/:courseId',         protect, authorize('student'), enroll);
router.get('/my',                 protect, authorize('student'), getMyEnrollments);
router.put('/:courseId/progress', protect, authorize('student'), updateProgress);
// Instructor/admin: get enrollments for a course (with student names)
router.get('/by-course/:courseId', protect, authorize('instructor','admin'), getByCourse);

module.exports = router;
