const jwt     = require('jsonwebtoken');
const { db }  = require('../config/firebase');
const COLS    = require('../config/collections');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized — no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eduverse_secret');
    const snap    = await db.collection(COLS.USERS).doc(decoded.id).get();
    if (!snap.exists) return res.status(401).json({ message: 'User not found' });
    const user = { id: snap.id, ...snap.data() };
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });
    delete user.password;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: `Role '${req.user.role}' not permitted` });
  next();
};

module.exports = { protect, authorize };
