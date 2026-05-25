const Announcement = require('../models/Announcement.model');
const Course       = require('../models/Course.model');
const { createNotification } = require('./notification.controller');

exports.getByCourse = async (req, res) => {
  try {
    const anns = await Announcement.find({ courseId: req.params.courseId })
      .sort({ pinned: -1, createdAt: -1 }).lean();
    res.json(anns);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { title, content, pinned } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content required' });
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const ann = await Announcement.create({
      title, content, pinned: !!pinned,
      courseId:       course._id,
      courseName:     course.title,
      instructorId:   req.user.id,
      instructorName: req.user.name,
    });

    for (const studentId of (course.enrolledStudents || [])) {
      await createNotification(studentId, {
        title:   `📢 ${title}`,
        message: `${course.title}: ${content.substring(0, 100)}`,
        type:    'info',
        link:    `/student/course/${course._id}`,
      }).catch(() => {});
    }
    res.status(201).json(ann);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
