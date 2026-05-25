const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentId:        { type: String, required: true },
  studentName:      String,
  courseId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  courseName:       String,
  instructorId:     String,
  instructorName:   String,
  progress:         { type: Number, default: 0, min: 0, max: 100 },
  completedLectures:{ type: [String], default: [] },
  status:           { type: String, enum: ['active','completed','dropped'], default: 'active' },
  completedAt:      Date,
  certificateIssued:{ type: Boolean, default: false },
}, { timestamps: true });

// Unique: one student per course
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
