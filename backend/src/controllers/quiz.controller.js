const Quiz     = require('../models/Quiz.model');
const Course   = require('../models/Course.model');
const Progress = require('../models/Progress.model');
const { createNotification } = require('./notification.controller');

// GET /api/courses/:courseId/quizzes
exports.getByCourse = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId, status: 'published' })
      .sort({ createdAt: -1 }).lean();

    if (req.user.role === 'student') {
      return res.json(quizzes.map(q => ({
        ...q,
        questions: q.questions?.map(qs => ({
          ...qs,
          options: qs.options?.map(o => ({ _id: o._id, text: o.text })),
        })),
        attempts: q.attempts?.filter(a => a.studentId === req.user.id) || [],
      })));
    }
    res.json(quizzes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/courses/:courseId/quizzes
exports.create = async (req, res) => {
  try {
    const { title, questions, timeLimit, passingScore, dueDate } = req.body;
    if (!title || !questions?.length)
      return res.status(400).json({ message: 'Title and questions required' });

    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const quiz = await Quiz.create({
      title, courseId: course._id, courseName: course.title,
      instructorId: req.user.id,
      questions, timeLimit: Number(timeLimit) || 30,
      passingScore: Number(passingScore) || 60,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    // ✅ Notify all enrolled students — new quiz available
    for (const studentId of (course.enrolledStudents || [])) {
      await createNotification(studentId, {
        title:   `🧠 New Quiz: ${title}`,
        message: `${course.title}${dueDate ? ` — Due: ${new Date(dueDate).toLocaleDateString('en-PK')}` : ''}`,
        type:    'info',
        link:    '/student/quizzes',
      }).catch(() => {});
    }

    res.status(201).json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/quizzes/:quizId/submit
exports.submit = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const { answers } = req.body;
    let score = 0;
    const totalPoints = quiz.questions.reduce((s, q) => s + (q.points || 1), 0);

    quiz.questions.forEach((q, idx) => {
      const ans = answers?.find(a => a.questionIndex === idx);
      if (ans !== undefined && q.options[ans.selectedOption]?.isCorrect)
        score += (q.points || 1);
    });

    const percentage = Math.round((score / totalPoints) * 100);
    const passed     = percentage >= quiz.passingScore;

    quiz.attempts.push({
      studentId:   req.user.id,
      studentName: req.user.name,
      answers:     answers || [],
      score, percentage, passed,
      completedAt: new Date(),
    });
    await quiz.save();

    await Progress.findOneAndUpdate(
      { studentId: req.user.id, courseId: quiz.courseId },
      { $push: { quizScores: { quizId: quiz._id.toString(), score, percentage, completedAt: new Date() } } },
      { upsert: true }
    );

    // ✅ Notification — Student: quiz result
    await createNotification(req.user.id, {
      title:   `🧠 Quiz Result: ${quiz.title}`,
      message: `You scored ${percentage}% (${score}/${totalPoints} pts) — ${passed ? 'Passed! 🎉' : 'Not passed. Try again 💪'}`,
      type:    passed ? 'success' : 'warning',
      link:    '/student/quizzes',
    });

    // ✅ Notification — Instructor: student attempted quiz
    await createNotification(quiz.instructorId, {
      title:   `📊 Quiz Attempted: ${quiz.title}`,
      message: `${req.user.name} scored ${percentage}% on "${quiz.title}" — ${passed ? 'Passed ✅' : 'Failed ❌'}`,
      type:    passed ? 'success' : 'info',
      link:    '/instructor/quizzes',
    });

    res.json({ score, percentage, passed, totalPoints, passingScore: quiz.passingScore });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/quizzes/:quizId/attempts
exports.getAttempts = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).select('attempts title').lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz.attempts || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
