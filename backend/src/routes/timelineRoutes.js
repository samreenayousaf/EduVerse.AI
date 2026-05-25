const express = require('express');
const router  = express.Router();
const { getTimeline } = require('../controllers/timeline.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('student'), getTimeline);

module.exports = router;
