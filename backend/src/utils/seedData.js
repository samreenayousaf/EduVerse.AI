require('dotenv').config();
const bcrypt         = require('bcryptjs');
const { db }         = require('../config/firebase');
const connectMongoDB = require('../config/mongodb');
const Course         = require('../models/Course.model');
const Assignment     = require('../models/Assignment.model');
const Quiz           = require('../models/Quiz.model');
const Enrollment     = require('../models/Enrollment.model');
const COLS           = require('../config/collections');

const seed = async () => {
  await connectMongoDB();
  console.log('\n🌱 Setting up EduVerse.AI v3.0 — Hybrid Data...\n');

  // ── Clean MongoDB ──
  await Course.deleteMany({});
  await Assignment.deleteMany({});
  await Quiz.deleteMany({});
  await Enrollment.deleteMany({});
  console.log('  🧹 MongoDB cleared');

  // ── Clean Firebase Users ──
  const oldIds = ['admin-samreena-001','instructor-bilal-001','instructor-ayesha-001','student-ahmed-001'];
  for (const id of oldIds) await db.collection(COLS.USERS).doc(id).delete().catch(() => {});
  console.log('  🧹 Firebase users cleared\n');

  // ══════════════════════════════════════════════════
  // FIREBASE USERS
  // ══════════════════════════════════════════════════
  const adminId  = 'admin-samreena-001';
  const instr1Id = 'instructor-bilal-001';
  const instr2Id = 'instructor-ayesha-001';
  const stdId    = 'student-ahmed-001';

  await db.collection(COLS.USERS).doc(adminId).set({
    name:'Samreena Khan', email:'samreena@eduverse.com',
    password: await bcrypt.hash('Samreena@2024', 12),
    role:'admin', isActive:true, bio:'Platform Administrator',
    enrolledCourses:[], createdCourses:[], createdAt: new Date().toISOString(),
  });
  await db.collection(COLS.USERS).doc(instr1Id).set({
    name:'Bilal Ahmed', email:'bilal@eduverse.com',
    password: await bcrypt.hash('Bilal@PNY2024', 12),
    role:'instructor', isActive:true, bio:'Senior Web Developer — 8 years experience',
    enrolledCourses:[], createdCourses:[], createdAt: new Date().toISOString(),
  });
  await db.collection(COLS.USERS).doc(instr2Id).set({
    name:'Ayesha Siddiqui', email:'ayesha@eduverse.com',
    password: await bcrypt.hash('Ayesha@PNY2024', 12),
    role:'instructor', isActive:true, bio:'UI/UX Designer & Python Educator',
    enrolledCourses:[], createdCourses:[], createdAt: new Date().toISOString(),
  });
  await db.collection(COLS.USERS).doc(stdId).set({
    name:'Ahmed Raza', email:'ahmed@student.com',
    password: await bcrypt.hash('Student@123', 12),
    role:'student', isActive:true, bio:'Aspiring Developer',
    enrolledCourses:[], createdCourses:[], createdAt: new Date().toISOString(),
  });
  console.log('  ✅ Firebase users created (4)');

  // ══════════════════════════════════════════════════
  // MONGODB COURSES
  // ══════════════════════════════════════════════════
  const c1 = await Course.create({
    title:'React & Node.js Full Stack', category:'Web Development',
    description:'Complete MERN stack from beginner to advanced. React hooks, REST APIs, JWT auth, deployment.',
    instructorId:instr1Id, instructorName:'Bilal Ahmed',
    level:'Intermediate', duration:'32h', price:4999, status:'published',
    tags:['React','Node.js','MongoDB','Express'],
    enrolledStudents:[stdId],
    lectures:[
      {title:'JavaScript ES6+',         type:'video', duration:'45min', order:0},
      {title:'React Fundamentals',       type:'video', duration:'60min', order:1},
      {title:'React Hooks',              type:'video', duration:'55min', order:2},
      {title:'Node.js & Express',        type:'video', duration:'50min', order:3},
      {title:'REST API Development',     type:'video', duration:'65min', order:4},
      {title:'MongoDB & Mongoose',       type:'video', duration:'60min', order:5},
      {title:'JWT Authentication',       type:'video', duration:'45min', order:6},
      {title:'Deployment',               type:'video', duration:'70min', order:7},
    ],
  });

  const c2 = await Course.create({
    title:'HTML CSS & JavaScript Basics', category:'Web Development',
    description:'Start web dev journey. HTML, CSS Flexbox/Grid, JavaScript fundamentals.',
    instructorId:instr1Id, instructorName:'Bilal Ahmed',
    level:'Beginner', duration:'20h', price:2999, status:'published',
    tags:['HTML','CSS','JavaScript'],
    lectures:[
      {title:'HTML Structure',    type:'video', duration:'40min', order:0},
      {title:'CSS Styling',       type:'video', duration:'50min', order:1},
      {title:'Flexbox & Grid',    type:'video', duration:'45min', order:2},
      {title:'JavaScript Basics', type:'video', duration:'55min', order:3},
      {title:'DOM Manipulation',  type:'video', duration:'50min', order:4},
    ],
  });

  const c3 = await Course.create({
    title:'UI/UX Design with Figma', category:'Design',
    description:'Master design thinking, wireframing, prototyping and Figma.',
    instructorId:instr2Id, instructorName:'Ayesha Siddiqui',
    level:'Beginner', duration:'18h', price:3499, status:'published',
    tags:['Figma','UI Design','UX','Prototyping'],
    lectures:[
      {title:'Design Thinking',     type:'video', duration:'35min', order:0},
      {title:'Figma Tour',          type:'video', duration:'40min', order:1},
      {title:'Typography & Color',  type:'video', duration:'45min', order:2},
      {title:'Wireframing',         type:'video', duration:'50min', order:3},
      {title:'Prototyping',         type:'video', duration:'55min', order:4},
    ],
  });

  const c4 = await Course.create({
    title:'Python for Data Science', category:'Data Science',
    description:'Python, NumPy, Pandas, Matplotlib and intro to ML.',
    instructorId:instr2Id, instructorName:'Ayesha Siddiqui',
    level:'Beginner', duration:'28h', price:3999, status:'published',
    tags:['Python','Pandas','NumPy','Machine Learning'],
    lectures:[
      {title:'Python Basics',      type:'video', duration:'40min', order:0},
      {title:'NumPy Arrays',       type:'video', duration:'50min', order:1},
      {title:'Pandas DataFrames',  type:'video', duration:'55min', order:2},
      {title:'Data Cleaning',      type:'video', duration:'50min', order:3},
      {title:'Matplotlib Charts',  type:'video', duration:'45min', order:4},
      {title:'Intro to ML',        type:'video', duration:'60min', order:5},
    ],
  });
  console.log('  ✅ MongoDB courses created (4)');

  // Update instructor createdCourses in Firebase
  await db.collection(COLS.USERS).doc(instr1Id).update({ createdCourses:[c1._id.toString(), c2._id.toString()] });
  await db.collection(COLS.USERS).doc(instr2Id).update({ createdCourses:[c3._id.toString(), c4._id.toString()] });

  // ══════════════════════════════════════════════════
  // ENROLLMENT — Ahmed in React course
  // ══════════════════════════════════════════════════
  await Enrollment.create({
    studentId:stdId, studentName:'Ahmed Raza',
    courseId:c1._id, courseName:c1.title,
    instructorId:instr1Id, instructorName:'Bilal Ahmed',
    progress:35, status:'active',
  });
  await db.collection(COLS.USERS).doc(stdId).update({ enrolledCourses:[c1._id.toString()] });
  console.log('  ✅ Enrollment created');

  // ══════════════════════════════════════════════════
  // ASSIGNMENTS
  // ══════════════════════════════════════════════════
  await Assignment.create({
    title:'Build a Todo App with React Hooks',
    description:'Create a Todo app with useState, useEffect, localStorage. Add filter & delete.',
    courseId:c1._id, courseName:c1.title, instructorId:instr1Id,
    dueDate: new Date(Date.now() + 7*24*60*60*1000),
    totalPoints:100, allowLate:true,
  });
  await Assignment.create({
    title:'Design a Food Delivery App UI in Figma',
    description:'Design splash, onboarding, home, product, cart & checkout screens.',
    courseId:c3._id, courseName:c3.title, instructorId:instr2Id,
    dueDate: new Date(Date.now() + 10*24*60*60*1000),
    totalPoints:100, allowLate:false,
  });
  console.log('  ✅ Assignments created (2)');

  // ══════════════════════════════════════════════════
  // QUIZZES
  // ══════════════════════════════════════════════════
  await Quiz.create({
    title:'React Fundamentals Quiz', courseId:c1._id, courseName:c1.title,
    instructorId:instr1Id, timeLimit:15, passingScore:60,
    questions:[
      { question:'What is JSX?', options:[
        {text:'CSS preprocessor', isCorrect:false},
        {text:'JavaScript XML extension', isCorrect:true},
        {text:'Backend framework', isCorrect:false},
        {text:'Database language', isCorrect:false},
      ], points:1 },
      { question:'Which hook manages state?', options:[
        {text:'useEffect',  isCorrect:false},
        {text:'useContext', isCorrect:false},
        {text:'useState',   isCorrect:true},
        {text:'useReducer', isCorrect:false},
      ], points:1 },
      { question:'What does useEffect do?', options:[
        {text:'Manages state',    isCorrect:false},
        {text:'Handles side effects', isCorrect:true},
        {text:'Creates components', isCorrect:false},
        {text:'Styles components',  isCorrect:false},
      ], points:1 },
    ],
  });
  await Quiz.create({
    title:'Figma Design Basics Quiz', courseId:c3._id, courseName:c3.title,
    instructorId:instr2Id, timeLimit:10, passingScore:60,
    questions:[
      { question:'What is UI design?', options:[
        {text:'User Interface — visual layout', isCorrect:true},
        {text:'A programming language', isCorrect:false},
        {text:'A database type', isCorrect:false},
        {text:'A testing framework', isCorrect:false},
      ], points:1 },
      { question:'What is a wireframe?', options:[
        {text:'Finished design',              isCorrect:false},
        {text:'Low-fidelity layout sketch',   isCorrect:true},
        {text:'Color scheme',                 isCorrect:false},
        {text:'Font type',                    isCorrect:false},
      ], points:1 },
    ],
  });
  console.log('  ✅ Quizzes created (2)');

  // Welcome notifications in Firebase
  for (const [uid, msg] of [
    [adminId,  {title:'Welcome, Samreena! 👋', message:'Admin panel ready.', type:'success'}],
    [instr1Id, {title:'Welcome, Bilal! 🎓',    message:'2 courses live on MongoDB.', type:'success'}],
    [instr2Id, {title:'Welcome, Ayesha! 🎓',   message:'2 courses live on MongoDB.', type:'success'}],
    [stdId,    {title:'Welcome! 🚀',            message:'Enrolled in React course. Start learning!', type:'success'}],
  ]) {
    await db.collection('notifications').add({ userId:uid, ...msg, read:false, link:'', createdAt:new Date().toISOString() });
  }

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║           ✅ EduVerse.AI v3.0 — Setup Complete!             ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  🔥 FIREBASE  → Users, Notifications, FCM                   ║');
  console.log('║  🍃 MONGODB   → Courses, Assignments, Quizzes, Progress     ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  Admin:       samreena@eduverse.com  /  Samreena@2024        ║');
  console.log('║  Instructor1: bilal@eduverse.com     /  Bilal@PNY2024        ║');
  console.log('║  Instructor2: ayesha@eduverse.com    /  Ayesha@PNY2024       ║');
  console.log('║  Student:     ahmed@student.com      /  Student@123          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  process.exit(0);
};

seed().catch(err => { console.error('\n❌ Seed failed:', err.message); process.exit(1); });
