const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Data to be included in token
 * @param {String} secret - Secret key for signing
 * @param {String|Number} expiresIn - Token expiration time
 * @returns {String} JWT token
 */
const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate access token
 * @param {Object} user - User object
 * @returns {String} Access token
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role
  };
  
  return generateToken(
    payload,
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRE || '7d'
  );
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {String} Refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id
  };
  
  return generateToken(
    payload,
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRE || '30d'
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @param {String} secret - Secret key for verification
 * @returns {Object|null} Decoded token or null if invalid
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

/**
 * Verify access token
 * @param {String} token - Access token to verify
 * @returns {Object|null} Decoded token or null if invalid
 */
const verifyAccessToken = (token) => {
  return verifyToken(token, process.env.JWT_SECRET);
};

/**
 * Verify refresh token
 * @param {String} token - Refresh token to verify
 * @returns {Object|null} Decoded token or null if invalid
 */
const verifyRefreshToken = (token) => {
  return verifyToken(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
}; 