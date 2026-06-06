const Course      = require('../models/Course.model');
const Enrollment  = require('../models/Enrollment.model');
const Assignment  = require('../models/Assignment.model');
const Quiz        = require('../models/Quiz.model');
const { db }      = require('../config/firebase');
const COLS        = require('../config/collections');

// GET /api/analytics/student
exports.getStudentAnalytics = async (req, res) => {
  try {
    const uid = req.user.id;
    const [enrollments, assignments, quizzes] = await Promise.all([
      Enrollment.find({ studentId: uid }).lean(),
      Assignment.find({}).lean(),
      Quiz.find({}).lean(),
    ]);
    const mySubmissions = assignments.flatMap(a =>
      a.submissions.filter(s => s.studentId === uid && s.grade !== null)
    );
    const myAttempts = quizzes.flatMap(q =>
      q.attempts.filter(a => a.studentId === uid)
    );
    const avgProgress = enrollments.length
      ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length) : 0;
    const avgGrade = mySubmissions.length
      ? Math.round(mySubmissions.reduce((s, sub) => s + sub.grade, 0) / mySubmissions.length) : 0;
    const avgQuizScore = myAttempts.length
      ? Math.round(myAttempts.reduce((s, a) => s + a.percentage, 0) / myAttempts.length) : 0;
    res.json({
      enrolledCourses:  enrollments.length,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      avgProgress, avgGrade, avgQuizScore,
      totalSubmissions: mySubmissions.length,
      totalAttempts:    myAttempts.length,
      enrollments,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/analytics/instructor  ← FIXED: now returns real data
exports.getInstructorAnalytics = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const [courses, assignments] = await Promise.all([
      Course.find({ instructorId }).lean(),
      Assignment.find({ instructorId }).lean(),
    ]);

    const courseIds = courses.map(c => c._id.toString());
    const enrollments = await Enrollment.find({
      courseId: { $in: courses.map(c => c._id) }
    }).lean();

    const totalStudents = courses.reduce((s, c) => s + (c.enrolledStudents?.length || 0), 0);

    // ── Monthly enrollments (last 6 months) ──────────────────────────
    const now = new Date();
    const monthlyMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-US', { month: 'short' });
      monthlyMap[key] = 0;
    }
    enrollments.forEach(e => {
      const d = new Date(e.createdAt);
      const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (monthsAgo >= 0 && monthsAgo <= 5) {
        const key = d.toLocaleString('en-US', { month: 'short' });
        if (key in monthlyMap) monthlyMap[key]++;
      }
    });
    const monthlyEnrollments = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

    // ── Avg score by course (from graded submissions) ─────────────────
    const courseScores = courses.map(course => {
      const courseAssignments = assignments.filter(
        a => a.courseId.toString() === course._id.toString()
      );
      const allGrades = courseAssignments.flatMap(a =>
        a.submissions.filter(s => s.grade !== null).map(s => s.grade)
      );
      const avgScore = allGrades.length
        ? Math.round(allGrades.reduce((s, g) => s + g, 0) / allGrades.length)
        : 0;
      return { name: course.title, score: avgScore, students: course.enrolledStudents?.length || 0 };
    });

    // ── Students by course (for pie chart) ───────────────────────────
    const studentsByCourse = courses.map((c, i) => ({
      name: c.title.length > 12 ? c.title.substring(0, 12) + '…' : c.title,
      value: c.enrolledStudents?.length || 0,
    })).filter(c => c.value > 0);

    // ── Top students (by progress across all instructor courses) ─────
    const studentMap = {};
    enrollments.forEach(e => {
      const sid = e.studentId;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          name:       e.studentName || 'Student',
          course:     e.courseName  || '',
          progress:   e.progress    || 0,
          grades:     [],
        };
      }
      // Keep highest-progress course per student
      if (e.progress > studentMap[sid].progress) {
        studentMap[sid].progress = e.progress;
        studentMap[sid].course   = e.courseName || '';
      }
    });

    // Attach avg grade from submissions
    assignments.forEach(a => {
      a.submissions.forEach(s => {
        if (s.grade !== null && studentMap[s.studentId]) {
          studentMap[s.studentId].grades.push(s.grade);
        }
      });
    });

    const topStudents = Object.values(studentMap)
      .map(s => ({
        name:     s.name,
        course:   s.course,
        progress: s.progress,
        grade:    s.grades.length
          ? Math.round(s.grades.reduce((a, b) => a + b, 0) / s.grades.length)
          : null,
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);

    // ── Completion rate ───────────────────────────────────────────────
    const completionRate = enrollments.length
      ? Math.round(enrollments.filter(e => e.status === 'completed').length / enrollments.length * 100)
      : 0;

    // ── Avg grade across all ──────────────────────────────────────────
    const allGrades = assignments.flatMap(a =>
      a.submissions.filter(s => s.grade !== null).map(s => s.grade)
    );
    const avgGrade = allGrades.length
      ? Math.round(allGrades.reduce((s, g) => s + g, 0) / allGrades.length)
      : 0;

    res.json({
      totalCourses:      courses.length,
      totalStudents,
      totalEnrollments:  enrollments.length,
      completionRate,
      avgGrade,
      monthlyEnrollments,
      courseScores,
      studentsByCourse,
      topStudents,
      courses,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/analytics/admin
exports.getAdminAnalytics = async (req, res) => {
  try {
    const [courses, enrollments] = await Promise.all([
      Course.find().lean(),
      Enrollment.find().lean(),
    ]);
    const usersSnap = await db.collection(COLS.USERS).get();
    const users = usersSnap.docs.map(d => d.data());
    const byCategory = {};
    courses.forEach(c => { byCategory[c.category] = (byCategory[c.category] || 0) + 1; });
    res.json({
      totalUsers:       users.length,
      totalStudents:    users.filter(u => u.role === 'student').length,
      totalInstructors: users.filter(u => u.role === 'instructor').length,
      totalCourses:     courses.length,
      publishedCourses: courses.filter(c => c.status === 'published').length,
      totalEnrollments: enrollments.length,
      coursesByCategory: Object.entries(byCategory).map(([_id, count]) => ({ _id, count })),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};