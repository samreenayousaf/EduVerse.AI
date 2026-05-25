const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  content:        { type: String, required: true },
  courseId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  courseName:     String,
  instructorId:   { type: String, required: true },
  instructorName: String,
  pinned:         { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
