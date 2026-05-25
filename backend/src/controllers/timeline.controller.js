const Assignment = require('../models/Assignment.model');
const Quiz       = require('../models/Quiz.model');
const Enrollment = require('../models/Enrollment.model');

exports.getTimeline = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id }).lean();
    const courseIds   = enrollments.map(e => e.courseId);

    const [assignments, quizzes] = await Promise.all([
      Assignment.find({ courseId: { $in: courseIds } }).sort({ dueDate: 1 }).lean(),
      Quiz.find({ courseId: { $in: courseIds }, status: 'published' }).sort({ dueDate: 1 }).lean(),
    ]);

    const timeline = [
      ...assignments.map(a => ({
        _id:         a._id,
        type:        'assignment',
        title:       a.title,
        courseId:    a.courseId,
        courseName:  a.courseName,
        dueDate:     a.dueDate,
        totalPoints: a.totalPoints,
        mySubmission: a.submissions?.find(s => s.studentId === req.user.id) || null,
      })),
      ...quizzes.map(q => ({
        _id:        q._id,
        type:       'quiz',
        title:      q.title,
        courseId:   q.courseId,
        courseName: q.courseName,
        dueDate:    q.dueDate || q.createdAt,
        timeLimit:  q.timeLimit,
        attempted:  q.attempts?.some(a => a.studentId === req.user.id) || false,
      })),
    ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json(timeline);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
