const express = require('express');
const router  = express.Router();
const { getStudentAnalytics, getInstructorAnalytics, getAdminAnalytics } = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/student',    protect, authorize('student'),    getStudentAnalytics);
router.get('/instructor', protect, authorize('instructor'), getInstructorAnalytics);
router.get('/admin',      protect, authorize('admin'),      getAdminAnalytics);

module.exports = router;
