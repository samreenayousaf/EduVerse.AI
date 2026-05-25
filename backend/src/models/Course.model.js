const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type:        { type: String, enum: ['video','pdf','assignment','quiz','announcement','file'], default: 'video' },
  title:       { type: String, required: true },
  content:     { type: String, default: '' },
  fileUrl:     { type: String, default: '' },
  fileName:    { type: String, default: '' },
  fileSize:    { type: String, default: '' },
  duration:    { type: String, default: '' },
  isFree:      { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
  refId:       { type: String, default: '' },
  openDate:    { type: Date, default: null },
  closeDate:   { type: Date, default: null },
}, { _id: true });

const weekSchema = new mongoose.Schema({
  title:       { type: String, default: '' },
  weekNumber:  { type: Number, default: 0 },
  description: { type: String, default: '' },
  activities:  [activitySchema],
  collapsed:   { type: Boolean, default: false },
}, { _id: true });

const reviewSchema = new mongoose.Schema({
  studentId:   String,
  studentName: String,
  rating:      { type: Number, min: 1, max: 5 },
  comment:     String,
  createdAt:   { type: Date, default: Date.now },
});

const courseSchema = new mongoose.Schema({
  title:            { type: String, required: true, trim: true, index: true },
  description:      { type: String, required: true },
  instructorId:     { type: String, required: true, index: true },
  instructorName:   { type: String, required: true },
  // Admin assigns instructors — array of instructor IDs allowed to manage this course
  assignedInstructors: { type: [String], default: [] },
  category:         { type: String, required: true, index: true },
  level:            { type: String, enum: ['Beginner','Intermediate','Advanced'], default: 'Beginner' },
  duration:         { type: String, default: '' },
  price:            { type: Number, default: 0 },
  thumbnail:        { type: String, default: '' },
  status:           { type: String, enum: ['draft','published','archived'], default: 'published', index: true },
  tags:             [String],
  requirements:     [String],
  objectives:       [String],
  weeks:            [weekSchema],
  lectures:         { type: Array, default: [] },
  reviews:          [reviewSchema],
  enrolledStudents: { type: [String], default: [] },
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
});

courseSchema.virtual('studentsCount').get(function () { return this.enrolledStudents.length; });
courseSchema.virtual('lectureCount').get(function () {
  return this.weeks.reduce((s,w) => s + w.activities.length, 0);
});

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
module.exports = mongoose.model('Course', courseSchema);
