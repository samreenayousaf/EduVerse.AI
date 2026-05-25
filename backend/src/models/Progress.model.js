const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  studentId:         { type: String, required: true },
  courseId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLectures: { type: [String], default: [] },
  quizScores:        [{ quizId: String, score: Number, percentage: Number, completedAt: Date }],
  assignmentGrades:  [{ assignmentId: String, grade: Number, gradedAt: Date }],
  percentage:        { type: Number, default: 0 },
  lastAccessed:      { type: Date, default: Date.now },
}, { timestamps: true });

progressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
