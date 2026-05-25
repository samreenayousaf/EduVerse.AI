const Enrollment = require('../models/Enrollment.model');
const Course     = require('../models/Course.model');
const Progress   = require('../models/Progress.model');
const { db, admin } = require('../config/firebase');
const COLS       = require('../config/collections');
const { createNotification } = require('./notification.controller');

// POST /api/enrollments/:courseId
exports.enroll = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.status !== 'published') return res.status(400).json({ message: 'Course not available' });

    const exists = await Enrollment.findOne({ studentId: req.user.id, courseId: course._id });
    if (exists) return res.status(400).json({ message: 'Already enrolled' });

    const enrollment = await Enrollment.create({
      studentId:     req.user.id,
      studentName:   req.user.name,
      courseId:      course._id,
      courseName:    course.title,
      instructorId:  course.instructorId,
      instructorName: course.instructorName,
    });

    await Progress.create({ studentId: req.user.id, courseId: course._id });

    await Course.findByIdAndUpdate(course._id, {
      $addToSet: { enrolledStudents: req.user.id },
    });

    await db.collection(COLS.USERS).doc(req.user.id).update({
      enrolledCourses: admin.firestore.FieldValue.arrayUnion(course._id.toString()),
    }).catch(() => {});

    // ✅ Notification 1 — Student: enrolled successfully
    await createNotification(req.user.id, {
      title:   `🎉 Enrolled: ${course.title}`,
      message: `You are now enrolled. Start learning with ${course.instructorName}!`,
      type:    'success',
      link:    `/student/course/${course._id}`,
    });

    // ✅ Notification 2 — Instructor: new student enrolled (with student name)
    await createNotification(course.instructorId, {
      title:   `👨‍🎓 New Student Enrolled!`,
      message: `${req.user.name} just enrolled in "${course.title}".`,
      type:    'info',
      link:    '/instructor/courses',
    });

    res.status(201).json({ message: 'Enrolled successfully!', enrollment });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already enrolled' });
    res.status(500).json({ message: err.message });
  }
};

// GET /api/enrollments/my
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id })
      .populate('courseId', 'title thumbnail category instructorName level duration weeks')
      .sort({ createdAt: -1 }).lean();
    res.json(enrollments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/enrollments/:courseId/progress
exports.updateProgress = async (req, res) => {
  try {
    const { progress, lectureId } = req.body;
    const newProgress = Math.min(Number(progress) || 0, 100);
    const update = { progress: newProgress };
    const wasCompleted = newProgress >= 100;
    if (wasCompleted) { update.status = 'completed'; update.completedAt = new Date(); }

    const enrollment = await Enrollment.findOneAndUpdate(
      { studentId: req.user.id, courseId: req.params.courseId },
      {
        $set: update,
        ...(lectureId && { $addToSet: { completedLectures: lectureId } }),
      },
      { new: true, upsert: false }
    );
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    await Progress.findOneAndUpdate(
      { studentId: req.user.id, courseId: req.params.courseId },
      {
        $set: { percentage: newProgress, lastAccessed: new Date() },
        ...(lectureId && { $addToSet: { completedLectures: lectureId } }),
      },
      { upsert: true }
    );

    // ✅ Notification 3 — Student: course completed 🏆
    if (wasCompleted) {
      const course = await Course.findById(req.params.courseId).select('title instructorId instructorName').lean();
      if (course) {
        await createNotification(req.user.id, {
          title:   `🏆 Course Completed!`,
          message: `Congratulations! You completed "${course.title}". Great work!`,
          type:    'success',
          link:    `/student/course/${req.params.courseId}`,
        });

        // ✅ Notification 4 — Instructor: student completed course
        await createNotification(course.instructorId, {
          title:   `🏆 Student Completed Course!`,
          message: `${req.user.name} completed "${course.title}".`,
          type:    'success',
          link:    '/instructor/courses',
        });
      }
    }

    res.json({ message: 'Progress updated', progress: newProgress });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/enrollments/by-course/:courseId — instructor/admin
exports.getByCourse = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ courseId: req.params.courseId })
      .sort({ createdAt: -1 }).lean();
    res.json(enrollments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
