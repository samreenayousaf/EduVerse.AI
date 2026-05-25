const bcrypt        = require('bcryptjs');
const { db }        = require('../config/firebase');
const COLS          = require('../config/collections');
const generateToken = require('../utils/generateToken');
const { createNotification } = require('./notification.controller');
const { snapToArr, serializeDoc } = require('../utils/firestore');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const existing = await db.collection(COLS.USERS).where('email', '==', email.toLowerCase()).get();
    if (!existing.empty) return res.status(400).json({ message: 'Email already registered' });

    const hashed      = await bcrypt.hash(password, 12);
    // Public registration is student-only. Instructors/admins are created by admin only.
    const allowedRoles = ['student'];
    const newUser = {
      name: name.trim(), email: email.toLowerCase(), password: hashed,
      role: allowedRoles.includes(role) ? role : 'student',
      isActive: true, bio: '', avatar: '',
      enrolledCourses: [], createdCourses: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };

    const ref = await db.collection(COLS.USERS).add(newUser);

    // Welcome notification
    await createNotification(ref.id, {
      title:   'Welcome to EduVerse.AI! 🎉',
      message: `Hi ${name}, your account has been created successfully.`,
      type:    'success',
    });

    // Notify all admins about new registration
    const adminsSnap = await db.collection(COLS.USERS).where('role', '==', 'admin').get();
    for (const adminDoc of adminsSnap.docs) {
      await createNotification(adminDoc.id, {
        title:   'New User Registered',
        message: `${name} (${email}) just registered as ${newUser.role}.`,
        type:    'info',
        link:    '/admin/users',
      });
    }

    res.status(201).json({ message: 'Registration successful. Please sign in.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const snap = await db.collection(COLS.USERS).where('email', '==', email.toLowerCase()).get();
    if (snap.empty) return res.status(401).json({ message: 'Invalid email or password' });

    const doc  = snap.docs[0];
    const user = { id: doc.id, ...doc.data() };

    const match = await bcrypt.compare(password, user.password);
    if (!match)      return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated. Contact admin.' });

    const now = new Date();
    await doc.ref.update({ lastLogin: now.toISOString() });

    // New login notification to user
    await createNotification(doc.id, {
      title:   'New Login Detected',
      message: `Login at ${now.toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}`,
      type:    'info',
    });

    // Notify admins about new login
    const adminsSnap = await db.collection(COLS.USERS).where('role', '==', 'admin').get();
    for (const adminDoc of adminsSnap.docs) {
      if (adminDoc.id !== doc.id) {
        await createNotification(adminDoc.id, {
          title:   `User Login: ${user.name}`,
          message: `${user.email} (${user.role}) logged in at ${now.toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}`,
          type:    'info',
          link:    '/admin/users',
        });
      }
    }

    const token = generateToken(doc.id);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: { ...safeUser, id: doc.id } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const snap = await db.collection(COLS.USERS).doc(req.user.id).get();
    if (!snap.exists) return res.status(404).json({ message: 'User not found' });
    const { password, ...user } = snap.data();
    res.json(serializeDoc({ id: snap.id, ...user }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updates = { updatedAt: new Date().toISOString() };
    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio;
    await db.collection(COLS.USERS).doc(req.user.id).update(updates);
    const snap = await db.collection(COLS.USERS).doc(req.user.id).get();
    const { password, ...user } = snap.data();
    res.json(serializeDoc({ id: snap.id, ...user }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/auth/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both passwords required' });
    const snap  = await db.collection(COLS.USERS).doc(req.user.id).get();
    const match = await bcrypt.compare(currentPassword, snap.data().password);
    if (!match) return res.status(400).json({ message: 'Current password incorrect' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await snap.ref.update({ password: hashed, updatedAt: new Date().toISOString() });
    await createNotification(req.user.id, {
      title: 'Password Changed', message: 'Your password was changed successfully.', type: 'success',
    });
    res.json({ message: 'Password updated successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Helper — create email transporter
const getTransporter = () => nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT)  || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const snap = await db.collection(COLS.USERS).where('email', '==', email.toLowerCase()).get();
    // Always return same message for security (prevent email enumeration)
    if (snap.empty) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const doc  = snap.docs[0];
    const user = { id: doc.id, ...doc.data() };

    // Generate secure token
    const resetToken  = crypto.randomBytes(32).toString('hex');
    const tokenHash   = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await doc.ref.update({ resetToken: tokenHash, resetTokenExpiry: tokenExpiry });

    const clientUrl  = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetLink  = `${clientUrl}/reset-password/${resetToken}`;

    // Send email
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from:    `"EduVerse" <${process.env.SMTP_USER}>`,
        to:      user.email,
        subject: 'Password Reset — EduVerse',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #E5E7EB">
            <h2 style="color:#111827;margin-bottom:8px">Reset Your Password</h2>
            <p style="color:#6B7280">Hi ${user.name},</p>
            <p style="color:#6B7280">We received a request to reset your EduVerse password. Click the button below to proceed. This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetLink}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#1F2937;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
            <p style="color:#9CA3AF;font-size:12px">If you didn't request this, ignore this email. Your password won't change.</p>
          </div>`,
      });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Don't expose email errors to client
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const { token }       = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const snap = await db.collection(COLS.USERS)
      .where('resetToken', '==', tokenHash).get();

    if (snap.empty) return res.status(400).json({ message: 'Invalid or expired reset link' });

    const doc  = snap.docs[0];
    const user = doc.data();

    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date())
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await doc.ref.update({
      password:          hashed,
      resetToken:        null,
      resetTokenExpiry:  null,
      updatedAt:         new Date().toISOString(),
    });

    await createNotification(doc.id, {
      title:   'Password Reset Successful',
      message: 'Your password has been reset. If this wasn\'t you, contact support immediately.',
      type:    'success',
    });

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
