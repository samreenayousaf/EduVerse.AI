const express = require('express');
const router  = express.Router({ mergeParams: true });
const { getByCourse, create, submit, getAttempts } = require('../controllers/quiz.controller');
const { protect, authorize } = require('../middleware/auth');

// /api/courses/:courseId/quizzes
router.get('/',  protect, getByCourse);
router.post('/', protect, authorize('instructor'), create);

// /api/quizzes/:quizId/submit
router.post('/:quizId/submit',   protect, authorize('student'),    submit);
router.get('/:quizId/attempts',  protect, authorize('instructor'), getAttempts);

module.exports = router;
