const User = require('../models/user.model');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt.util');
const { generateToken, generateVerificationToken, sendVerificationEmail, sendPasswordResetEmail, sendFarmerVerificationEmail } = require('../services/email.service');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Check if email configuration is set up
    if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      console.error('Email configuration missing. Skipping email verification.');
      
      // Create user without email verification if email config is missing
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        isEmailVerified: true // Auto-verify since we can't send emails
      });
      
      return res.status(201).json({
        success: true,
        message: 'Registration successful. You can now log in with your credentials. (Email verification skipped due to server configuration)'
      });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token valid for 24 hours

    // Create new user with verification token
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: tokenExpiry
    });

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
      
      // Return success response
      return res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account. A verification link has been sent to your email address.'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Still create the user but inform about email issue
      return res.status(201).json({
        success: true,
        message: 'Registration successful but unable to send verification email. Please contact support.'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found with this email. Please register first.'
      });
    }

    // Check if password matches
    const isMatch = await user.isPasswordMatch(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        isEmailVerified: false,
        email: user.email
      });
    }

    // Update last login time without triggering validation
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });
    user.lastLogin = new Date(); // Update the local user object as well

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return success response with tokens
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again later.'
    });
  }
};

/**
 * Verify email
 * @route POST /api/auth/verify-email
 * @access Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Find user with matching token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Generate tokens for auto login
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during email verification'
    });
  }
};

/**
 * Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Public
 */
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token valid for 24 hours

    // Update user with new token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = tokenExpiry;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while resending verification email'
    });
  }
};

/**
 * Forgot password
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = generateToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Update user with reset token
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = tokenExpiry;
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(user, resetToken);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing password reset request'
    });
  }
};

/**
 * Reset password
 * @route POST /api/auth/reset-password
 * @access Public
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find user with matching token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update user password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while resetting password'
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res) => {
  try {
    // User is already available from auth middleware
    const user = req.user;

    // Return user data
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user profile'
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res) => {
  // Note: In a stateless JWT authentication system, the actual logout happens on the client side
  // by removing the stored tokens. This endpoint is provided for consistency and future extensions.
  return res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

/**
 * Register a new farmer
 * @route POST /api/auth/register-farmer
 * @access Public
 */
const registerFarmer = async (req, res) => {
  try {
    const {
      // Step 1: Account Credentials
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      language,
      
      // Step 2: Farm Profile
      farm: {
        farmName,
        location,
        size,
        primaryCrops,
        yearsOfExperience,
        ownershipStatus
      },
      
      // Step 3: Agricultural Specifications
      farmSpecs: {
        soilType,
        waterSource,
        irrigationMethod,
        farmingMethodology,
        certifications,
        productionCapacity,
        seasonalPatterns
      },
      
      // Step 4: Business Setup
      businessProfile: {
        paymentMethods,
        accountDetails,
        transportationCapabilities,
        storageAvailable,
        marketReach
      }
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);

    // Create new farmer user
    const farmer = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      language,
      role: 'farmer',
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: tokenExpiry,
      
      farm: {
        farmName,
        location,
        size,
        crops: primaryCrops.map(crop => ({
          name: crop.name,
          variety: crop.variety,
          plantingDate: crop.plantingDate,
          expectedHarvestDate: crop.harvestDate,
          quantity: crop.quantity,
          unit: crop.unit
        })),
        soilType,
        irrigationMethod: waterSource,
        certifications: certifications.map(cert => ({
          type: cert.type,
          name: cert.name,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          certificationBody: cert.issuingBody
        }))
      },
      
      businessProfile: {
        businessName: farmName,
        paymentMethods,
        accountDetails,
        transportationCapabilities,
        storageAvailable,
        marketReach
      }
    });

    // Send verification email with farmer-specific template
    try {
      await sendFarmerVerificationEmail(farmer, verificationToken);
      
      return res.status(201).json({
        success: true,
        message: 'Farmer registration successful! Please check your email to verify your account.'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      return res.status(201).json({
        success: true,
        message: 'Registration successful but unable to send verification email. Please contact support.'
      });
    }
  } catch (error) {
    console.error('Farmer registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during farmer registration',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
  registerFarmer
}; 