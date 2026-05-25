const express = require('express');
const router  = express.Router();
const { getRecommendations, getAssignmentFeedback } = require('../controllers/ai.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/recommendations', protect, authorize('student'),    getRecommendations);
router.post('/feedback',       protect, authorize('instructor'), getAssignmentFeedback);

module.exports = router;
