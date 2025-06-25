const express = require('express');
const router = express.Router();
const { sendVerificationEmail } = require('../services/email.service');

// Import controllers
const {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
  registerFarmer
} = require('../controllers/auth.controller');

// Import middleware
const { protect } = require('../middleware/auth.middleware');
const {
  validate,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyEmailValidation
} = require('../middleware/validation.middleware');
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  verifyEmailLimiter
} = require('../middleware/rate-limiter.middleware');

// Auth routes
router.post('/register', registerLimiter, registerValidation, validate, register);
router.post('/register-farmer', registerLimiter, registerFarmer);
router.post('/login', loginLimiter, loginValidation, validate, login);
router.post('/verify-email', verifyEmailLimiter, verifyEmailValidation, validate, verifyEmail);
router.post('/resend-verification', verifyEmailLimiter, forgotPasswordValidation, validate, resendVerification);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', forgotPasswordLimiter, resetPasswordValidation, validate, resetPassword);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Test route for email verification (remove in production)
router.get('/test-email', async (req, res) => {
  try {
    const testUser = {
      email: req.query.email || 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    };
    
    const testToken = 'test-verification-token-123456';
    
    console.log('Sending test verification email to:', testUser.email);
    await sendVerificationEmail(testUser, testToken);
    
    res.status(200).json({
      success: true,
      message: 'Test verification email sent successfully'
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

module.exports = router; 