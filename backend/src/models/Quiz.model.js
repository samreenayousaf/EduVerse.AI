const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text:      { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const questionSchema = new mongoose.Schema({
  question:    { type: String, required: true },
  options:     [optionSchema],
  points:      { type: Number, default: 1 },
  explanation: String,
});

const attemptSchema = new mongoose.Schema({
  studentId:   String,
  studentName: String,
  answers:     [{ questionIndex: Number, selectedOption: Number }],
  score:       Number,
  percentage:  Number,
  passed:      Boolean,
  completedAt: { type: Date, default: Date.now },
});

const quizSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  courseId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  courseName:   String,
  instructorId: { type: String, required: true },
  questions:    [questionSchema],
  timeLimit:    { type: Number, default: 30 },
  passingScore: { type: Number, default: 60 },
  dueDate:      { type: Date, default: null },  // deadline for timeline
  status:       { type: String, enum: ['draft','published'], default: 'published' },
  attempts:     [attemptSchema],
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
