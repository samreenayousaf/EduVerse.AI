const Course   = require('../models/Course.model');
const { db }   = require('../config/firebase');
const COLS     = require('../config/collections');

// GET /api/courses — students see published, instructors see only assigned, admins see all
exports.getCourses = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      filter = { status: 'published' };
    } else if (req.user.role === 'instructor') {
      // Instructor sees only courses assigned by admin (assignedInstructors contains their id)
      filter = { assignedInstructors: req.user.id };
    }
    const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/courses/search
exports.searchCourses = async (req, res) => {
  try {
    const q = req.query.q || '';
    const courses = await Course.find({ status:'published', $or:[
      { title:{ $regex:q, $options:'i' } },
      { description:{ $regex:q, $options:'i' } },
      { tags:{ $regex:q, $options:'i' } },
    ]}).lean();
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/courses/:id
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/courses — instructor or admin creates course
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, level, duration, price, tags } = req.body;
    if (!title || !description || !category)
      return res.status(400).json({ message: 'Title, description and category required' });
    const defaultWeeks = [
      { title:'General', weekNumber:0, activities:[] },
      { title:'Week 1',  weekNumber:1, activities:[] },
      { title:'Week 2',  weekNumber:2, activities:[] },
      { title:'Week 3',  weekNumber:3, activities:[] },
    ];
    const course = await Course.create({
      title:title.trim(), description, category,
      level:level||'Beginner', duration:duration||'', price:Number(price)||0,
      tags:tags||[], instructorId:req.user.id, instructorName:req.user.name,
      status:'published', weeks:defaultWeeks,
      assignedInstructors:[req.user.id],
    });
    await db.collection(COLS.USERS).doc(req.user.id).update({
      createdCourses: require('firebase-admin').firestore.FieldValue.arrayUnion(course._id.toString()),
    }).catch(()=>{});
    res.status(201).json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Not found' });
    // Instructor must be assigned to this course or be admin
    if (req.user.role !== 'admin' && !course.assignedInstructors.includes(req.user.id))
      return res.status(403).json({ message: 'Not authorized' });
    const allowed = ['title','description','category','level','duration','price','status','tags','thumbnail','weeks'];
    allowed.forEach(k => { if (req.body[k] !== undefined) course[k] = req.body[k]; });
    await course.save();
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && !course.assignedInstructors.includes(req.user.id))
      return res.status(403).json({ message: 'Not authorized' });
    await course.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/courses/my — instructor: only assigned courses
exports.getInstructorCourses = async (req, res) => {
  try {
    let filter;
    if (req.user.role === 'admin') {
      filter = {}; // admin sees all
    } else {
      filter = { assignedInstructors: req.user.id };
    }
    const courses = await Course.find(filter).sort({ createdAt:-1 }).lean();
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/courses/:id/weeks
exports.addWeek = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message:'Not found' });
    if (req.user.role !== 'admin' && !course.assignedInstructors.includes(req.user.id))
      return res.status(403).json({ message:'Not authorized' });
    const weekNum = course.weeks.length;
    course.weeks.push({ title: req.body.title || `Week ${weekNum}`, weekNumber: weekNum, activities:[] });
    await course.save();
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/courses/:id/weeks/:weekId/activities
exports.addActivity = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message:'Not found' });
    if (req.user.role !== 'admin' && !course.assignedInstructors.includes(req.user.id))
      return res.status(403).json({ message:'Not authorized' });
    const week = course.weeks.id(req.params.weekId);
    if (!week) return res.status(404).json({ message:'Week not found' });
    const { type, title, content, fileUrl, fileName, fileSize, duration, isFree, refId, openDate, closeDate } = req.body;
    week.activities.push({ type, title, content:content||'', fileUrl:fileUrl||'',
      fileName:fileName||'', fileSize:fileSize||'', duration:duration||'',
      isFree:!!isFree, refId:refId||'', openDate:openDate||null, closeDate:closeDate||null,
      order: week.activities.length });
    await course.save();
    try {
      const { sendCourseNotification } = require('./fcm.controller');
      await sendCourseNotification(course._id.toString(), {
        title:`New Content: ${course.title}`,
        body:`"${title}" added to ${week.title}`,
      });
    } catch {}
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/courses/:id/weeks/:weekId/activities/:actId
exports.deleteActivity = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message:'Not found' });
    if (req.user.role !== 'admin' && !course.assignedInstructors.includes(req.user.id))
      return res.status(403).json({ message:'Not authorized' });
    const week = course.weeks.id(req.params.weekId);
    if (!week) return res.status(404).json({ message:'Week not found' });
    week.activities.pull({ _id: req.params.actId });
    await course.save();
    res.json({ message:'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
