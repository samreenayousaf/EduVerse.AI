const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'eduverse_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

module.exports = generateToken;
