const express = require('express');
const router  = express.Router();
const {
  register, login, getMe, updateProfile, changePassword,
  forgotPassword, resetPassword,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register',             register);
router.post('/login',                login);
router.get('/me',                    protect, getMe);
router.put('/profile',               protect, updateProfile);
router.put('/password',              protect, changePassword);

// Forgot / Reset password (no auth required)
router.post('/forgot-password',           forgotPassword);
router.post('/reset-password/:token',     resetPassword);

module.exports = router;

