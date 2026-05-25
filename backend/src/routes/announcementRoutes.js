const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/announcement.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/courses/:courseId/announcements',  protect, ctrl.getByCourse);
router.post('/courses/:courseId/announcements', protect, authorize('instructor','admin'), ctrl.create);
router.delete('/announcements/:id',             protect, authorize('instructor','admin'), ctrl.remove);

module.exports = router;
