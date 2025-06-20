const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Create nodemailer transporter
 * @returns {Object} Nodemailer transporter
 */
const createTransporter = () => {
  // Gmail and many other providers require secure connection
  const config = {
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    secure: true, // Use SSL/TLS
    tls: {
      rejectUnauthorized: false // Helps with self-signed certificates
    }
  };
  
  // If using SMTP directly instead of service
  if (process.env.EMAIL_HOST) {
    delete config.service;
    config.host = process.env.EMAIL_HOST;
    config.port = process.env.EMAIL_PORT || 465; // Default secure port
  }
  
  return nodemailer.createTransport(config);
};

/**
 * Generate a random token
 * @returns {String} Random token
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a verification token with UUID
 * @returns {String} UUID token
 */
const generateVerificationToken = () => {
  return uuidv4();
};

/**
 * Send email
 * @param {Object} options - Email options
 * @returns {Promise} Result of sending email
 */
const sendEmail = async (options) => {
  try {
    console.log('Creating email transporter with config:', {
      service: process.env.EMAIL_SERVICE,
      user: process.env.EMAIL_USERNAME ? process.env.EMAIL_USERNAME.substring(0, 3) + '...' : 'undefined',
      pass: process.env.EMAIL_PASSWORD ? 'password-exists' : 'undefined'
    });
    
    const transporter = createTransporter();
    
    console.log('Sending email to:', options.to);
    console.log('Email subject:', options.subject);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html
    };
    
    console.log('Mail options prepared, attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error details:', error);
    throw new Error('Email could not be sent');
  }
};

/**
 * Send verification email
 * @param {Object} user - User object
 * @param {String} token - Verification token
 * @returns {Promise} Result of sending email
 */
const sendVerificationEmail = async (user, token) => {
  // Make sure we have a properly formatted URL with encoded token
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const encodedToken = encodeURIComponent(token);
  const verificationUrl = `${frontendUrl}/verify-email?token=${encodedToken}`;
  
  console.log('Generated verification URL:', verificationUrl);
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4CAF50;">AgriConnect</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
        <h2>Verify Your Email Address</h2>
        <p>Hello ${user.firstName},</p>
        <p>Thank you for registering with AgriConnect. To complete your registration, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>If the button above doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address - AgriConnect',
    html
  });
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {String} token - Reset token
 * @returns {Promise} Result of sending email
 */
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4CAF50;">AgriConnect</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
        <h2>Reset Your Password</h2>
        <p>Hello ${user.firstName},</p>
        <p>You are receiving this email because you (or someone else) has requested to reset your password.</p>
        <p>Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button above doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request - AgriConnect',
    html
  });
};

/**
 * Send farmer verification email
 * @param {Object} user - User object
 * @param {string} token - Verification token
 */
const sendFarmerVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const emailContent = `
    <h2>Welcome to AgriConnect!</h2>
    <p>Dear ${user.firstName} ${user.lastName},</p>
    <p>Thank you for registering as a farmer on AgriConnect. We're excited to have you join our agricultural marketplace.</p>
    <p>Please verify your email address by clicking the button below:</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>Or copy and paste this link in your browser:</p>
    <p>${verificationUrl}</p>
    <p>This verification link will expire in 24 hours.</p>
    <h3>Next Steps After Verification:</h3>
    <ol>
      <li>Complete your farm profile setup</li>
      <li>Add your product listings</li>
      <li>Set up your payment methods</li>
      <li>Connect with buyers</li>
    </ol>
    <p>If you need any assistance, our support team is here to help.</p>
    <p>Best regards,<br>The AgriConnect Team</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Welcome to AgriConnect - Verify Your Farmer Account',
    html: emailContent
  });
};

module.exports = {
  generateToken,
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendFarmerVerificationEmail
}; 