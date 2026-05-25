const express = require('express');
const router  = express.Router();
const { saveToken } = require('../controllers/fcm.controller');
const { protect }   = require('../middleware/auth');

router.post('/token', protect, saveToken);

module.exports = router;
