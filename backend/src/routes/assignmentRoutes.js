const express = require('express');
const router  = express.Router({ mergeParams: true });
const {
  getByCourse, create, submit, getSubmissions, grade, getTimeline,
} = require('../controllers/assignment.controller');
const { protect, authorize } = require('../middleware/auth');

// Nested under /api/courses/:courseId/assignments
router.get('/',  protect, getByCourse);
router.post('/', protect, authorize('instructor'), create);

router.post('/:assignmentId/submit',
  protect, authorize('student'), submit);

router.get('/:assignmentId/submissions',
  protect, authorize('instructor', 'admin'), getSubmissions);

router.put('/:assignmentId/submissions/:submissionId/grade',
  protect, authorize('instructor'), grade);

module.exports = router;
