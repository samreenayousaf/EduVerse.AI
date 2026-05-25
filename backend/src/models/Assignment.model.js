const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId:   { type: String, required: true },
  studentName: String,
  content:     String,
  fileUrl:     String,
  fileName:    String,
  grade:       { type: Number, default: null },
  feedback:    String,
  status:      { type: String, enum: ['submitted','late','graded'], default: 'submitted' },
  submittedAt: { type: Date, default: Date.now },
  gradedAt:    Date,
});

const assignmentSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  String,
  courseId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  courseName:   String,
  instructorId: { type: String, required: true, index: true },
  dueDate:      { type: Date, required: true },
  totalPoints:  { type: Number, default: 100 },
  allowLate:    { type: Boolean, default: true },
  weekNumber:   { type: Number, default: 1 },   
  submissions:  [submissionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
