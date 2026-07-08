const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

/**
 * Signs and returns a JWT containing the user's id.
 * Keep the payload minimal — fetch fresh user data from DB on each
 * authenticated request rather than trusting stale claims.
 */
const generateToken = (userId) =>
  jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });

module.exports = generateToken;
