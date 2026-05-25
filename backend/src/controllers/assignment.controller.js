const Assignment = require('../models/Assignment.model');
const Course     = require('../models/Course.model');
const { db }     = require('../config/firebase');
const COLS       = require('../config/collections');
const { createNotification } = require('./notification.controller');

const notifyEnrolled = async (courseId, title, body) => {
  try {
    const { sendCourseNotification } = require('./fcm.controller');
    await sendCourseNotification(courseId.toString(), { title, body });
  } catch {}
};

// GET /api/courses/:courseId/assignments
exports.getByCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ courseId: req.params.courseId })
      .sort({ createdAt: -1 }).lean();
    if (req.user.role === 'student') {
      return res.json(assignments.map(a => ({
        ...a,
        mySubmission: a.submissions?.find(s => s.studentId === req.user.id) || null,
        submissions:  undefined,
      })));
    }
    res.json(assignments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/courses/:courseId/assignments
exports.create = async (req, res) => {
  try {
    const { title, description, dueDate, totalPoints, allowLate } = req.body;
    if (!title || !dueDate) return res.status(400).json({ message: 'Title and dueDate required' });

    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const assignment = await Assignment.create({
      title: title.trim(), description: description || '',
      courseId: course._id, courseName: course.title,
      instructorId: req.user.id,
      dueDate: new Date(dueDate),
      totalPoints: Number(totalPoints) || 100,
      allowLate: allowLate !== false,
    });

    await notifyEnrolled(course._id, `📝 New Assignment: ${course.title}`,
      `"${title}" due: ${new Date(dueDate).toLocaleDateString()}`);

    // Notify each enrolled student
    for (const studentId of (course.enrolledStudents || [])) {
      await createNotification(studentId, {
        title:   `📝 New Assignment: ${title}`,
        message: `Course: ${course.title} — Due: ${new Date(dueDate).toLocaleDateString('en-PK')}`,
        type:    'info',
        link:    '/student/assignments',
      }).catch(() => {});
    }

    res.status(201).json(assignment);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/assignments/:assignmentId/submit
exports.submit = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const already = assignment.submissions.find(s => s.studentId === req.user.id);
    if (already) return res.status(400).json({ message: 'Already submitted' });

    const isLate = new Date() > new Date(assignment.dueDate);
    if (isLate && !assignment.allowLate)
      return res.status(400).json({ message: 'Submission deadline passed' });

    assignment.submissions.push({
      studentId:   req.user.id,
      studentName: req.user.name,
      content:     req.body.content  || '',
      fileUrl:     req.body.fileUrl  || '',
      fileName:    req.body.fileName || '',
      status:      isLate ? 'late' : 'submitted',
      submittedAt: new Date(),
    });
    await assignment.save();

    // ✅ Notification — Instructor: new submission received (with student name)
    await createNotification(assignment.instructorId, {
      title:   `📬 New Submission: ${assignment.title}`,
      message: `${req.user.name} submitted "${assignment.title}"${isLate ? ' ⚠️ (submitted late)' : ''}.`,
      type:    isLate ? 'warning' : 'info',
      link:    '/instructor/assignments',
    });

    // ✅ Notification — Student: submission confirmed
    await createNotification(req.user.id, {
      title:   isLate ? `⚠️ Late Submission: ${assignment.title}` : `✅ Submitted: ${assignment.title}`,
      message: isLate
        ? `Your assignment was submitted after the deadline.`
        : `Your assignment was submitted successfully!`,
      type:    isLate ? 'warning' : 'success',
      link:    '/student/assignments',
    });

    res.status(201).json({ message: 'Submitted!', submission: assignment.submissions.slice(-1)[0] });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/assignments/:assignmentId/submissions
exports.getSubmissions = async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.assignmentId).lean();
    if (!a) return res.status(404).json({ message: 'Not found' });
    res.json(a.submissions || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/assignments/:assignmentId/submissions/:submissionId/grade
exports.grade = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    if (grade === undefined) return res.status(400).json({ message: 'Grade required' });

    const a = await Assignment.findById(req.params.assignmentId);
    if (!a) return res.status(404).json({ message: 'Not found' });

    const sub = a.submissions.id(req.params.submissionId);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });

    sub.grade    = Number(grade);
    sub.feedback = feedback || '';
    sub.status   = 'graded';
    sub.gradedAt = new Date();
    await a.save();

    const pct    = Math.round((Number(grade) / a.totalPoints) * 100);
    const passed = pct >= 60;

    // ✅ Notification — Student: assignment graded with score
    await createNotification(sub.studentId, {
      title:   `📊 Assignment Graded: ${a.title}`,
      message: `You scored ${grade}/${a.totalPoints} (${pct}%)${passed ? ' — Great job! ✅' : ' — Keep it up 💪'}${feedback ? ` | Feedback: ${feedback.substring(0, 80)}` : ''}`,
      type:    passed ? 'success' : 'warning',
      link:    '/student/assignments',
    });

    res.json({ message: 'Graded' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
