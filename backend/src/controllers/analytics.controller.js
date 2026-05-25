const Course     = require('../models/Course.model');
const Enrollment = require('../models/Enrollment.model');
const Assignment = require('../models/Assignment.model');
const Quiz       = require('../models/Quiz.model');
const { db }     = require('../config/firebase');
const COLS       = require('../config/collections');

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

    const avgProgress  = enrollments.length
      ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length) : 0;
    const avgGrade     = mySubmissions.length
      ? Math.round(mySubmissions.reduce((s, sub) => s + sub.grade, 0) / mySubmissions.length) : 0;
    const avgQuizScore = myAttempts.length
      ? Math.round(myAttempts.reduce((s, a) => s + a.percentage, 0) / myAttempts.length) : 0;

    res.json({
      enrolledCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      avgProgress, avgGrade, avgQuizScore,
      totalSubmissions: mySubmissions.length,
      totalAttempts: myAttempts.length,
      enrollments,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/analytics/instructor
exports.getInstructorAnalytics = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const [courses, assignments, quizzes] = await Promise.all([
      Course.find({ instructorId }).lean(),
      Assignment.find({ instructorId }).lean(),
      Quiz.find({ instructorId }).lean(),
    ]);

    const courseIds = courses.map(c => c._id.toString());

    // Enrollments per course
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).lean();

    const totalStudents = new Set(enrollments.map(e => e.studentId)).size;

    // ── Avg score per course (from graded assignment submissions) ──────────
    const coursePerf = courses.map(course => {
      const courseAssignments = assignments.filter(
        a => a.courseId.toString() === course._id.toString()
      );
      const gradedSubs = courseAssignments.flatMap(a =>
        a.submissions.filter(s => s.grade !== null && s.grade !== undefined)
      );
      const avgScore = gradedSubs.length
        ? Math.round(gradedSubs.reduce((sum, s) => sum + s.grade, 0) / gradedSubs.length)
        : null;
      return {
        name: course.title.length > 18 ? course.title.substring(0, 18) + '…' : course.title,
        fullName: course.title,
        score: avgScore,
        students: enrollments.filter(e => e.courseId.toString() === course._id.toString()).length,
      };
    }).filter(c => c.score !== null); // only courses with graded data

    // ── Students by course (for pie chart) ────────────────────────────────
    const studentsByCourse = courses.map(course => ({
      name: course.title.length > 14 ? course.title.substring(0, 14) + '…' : course.title,
      value: enrollments.filter(e => e.courseId.toString() === course._id.toString()).length,
    })).filter(c => c.value > 0);

    // ── Monthly enrollments (last 6 months) ────────────────────────────────
    const now      = new Date();
    const months   = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString('default', { month: 'short' }),
        year:  d.getFullYear(),
        monthNum: d.getMonth(),
        count: 0,
      });
    }
    enrollments.forEach(e => {
      const d = new Date(e.createdAt || e.enrolledAt);
      const m = months.find(x => x.monthNum === d.getMonth() && x.year === d.getFullYear());
      if (m) m.count++;
    });
    const monthlyEnroll = months.map(({ month, count }) => ({ month, count }));

    // ── Top students (by avg grade across all instructor's courses) ─────────
    const studentMap = {};
    assignments.forEach(a => {
      a.submissions.forEach(s => {
        if (s.grade === null || s.grade === undefined) return;
        if (!studentMap[s.studentId]) {
          studentMap[s.studentId] = {
            studentId: s.studentId,
            name: s.studentName || 'Unknown',
            grades: [], courseIds: new Set(),
          };
        }
        studentMap[s.studentId].grades.push(s.grade);
        studentMap[s.studentId].courseIds.add(a.courseId.toString());
      });
    });

    // Enrich with progress from enrollments
    const topStudents = await Promise.all(
      Object.values(studentMap)
        .map(st => {
          const avgGrade = Math.round(st.grades.reduce((a, b) => a + b, 0) / st.grades.length);
          const enroll   = enrollments.find(e => e.studentId === st.studentId);
          const course   = courses.find(c => st.courseIds.has(c._id.toString()));
          return {
            name:     st.name,
            course:   course?.title || '—',
            progress: enroll?.progress || 0,
            grade:    `${avgGrade}%`,
            gradeNum: avgGrade,
          };
        })
        .sort((a, b) => b.gradeNum - a.gradeNum)
        .slice(0, 6)
    );

    // ── Completion rate ────────────────────────────────────────────────────
    const completionRate = enrollments.length
      ? Math.round(enrollments.filter(e => e.status === 'completed').length / enrollments.length * 100)
      : 0;

    // ── Avg grade overall ──────────────────────────────────────────────────
    const allGrades = assignments.flatMap(a =>
      a.submissions.filter(s => s.grade !== null && s.grade !== undefined).map(s => s.grade)
    );
    const avgGradeOverall = allGrades.length
      ? Math.round(allGrades.reduce((a, b) => a + b, 0) / allGrades.length)
      : 0;

    res.json({
      totalCourses:    courses.length,
      totalStudents,
      avgGrade:        avgGradeOverall,
      completionRate,
      coursePerf,
      studentsByCourse,
      monthlyEnroll,
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
    const users     = usersSnap.docs.map(d => d.data());

    const byCategory = {};
    courses.forEach(c => { byCategory[c.category] = (byCategory[c.category] || 0) + 1; });

    res.json({
      totalUsers:        users.length,
      totalStudents:     users.filter(u => u.role === 'student').length,
      totalInstructors:  users.filter(u => u.role === 'instructor').length,
      totalCourses:      courses.length,
      publishedCourses:  courses.filter(c => c.status === 'published').length,
      totalEnrollments:  enrollments.length,
      coursesByCategory: Object.entries(byCategory).map(([_id, count]) => ({ _id, count })),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};