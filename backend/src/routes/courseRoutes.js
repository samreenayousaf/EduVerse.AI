
const express  = require('express');
const router   = express.Router();
const cc       = require('../controllers/course.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/',              cc.getCourses);
router.get('/search',        cc.searchCourses);
router.get('/my',            authorize('instructor','admin'), cc.getInstructorCourses);
router.get('/:id',           cc.getCourse);
router.post('/',             authorize('instructor','admin'), cc.createCourse);
router.put('/:id',           authorize('instructor','admin'), cc.updateCourse);
router.delete('/:id',        authorize('instructor','admin'), cc.deleteCourse);

// Week management
router.post('/:id/weeks',                            authorize('instructor','admin'), cc.addWeek);
router.post('/:id/weeks/:weekId/activities',         authorize('instructor','admin'), cc.addActivity);
router.delete('/:id/weeks/:weekId/activities/:actId',authorize('instructor','admin'), cc.deleteActivity);

// Assignments & Quizzes nested under course
router.use('/:courseId/assignments', require('../routes/assignmentRoutes'));
router.use('/:courseId/quizzes',     require('../routes/quizRoutes'));

module.exports = router;
