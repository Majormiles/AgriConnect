const { validationResult, body } = require('express-validator');

/**
 * Middleware to check validation results
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Registration validation rules
 */
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters')
    .trim(),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
    .trim(),
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Password reset request validation rules
 */
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

/**
 * Password reset validation rules
 */
const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

/**
 * Email verification validation rules
 */
const verifyEmailValidation = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
];

/**
 * Bank account verification validation rules
 */
const validateBankAccount = [
  body('accountNumber')
    .notEmpty()
    .withMessage('Account number is required')
    .isLength({ min: 10, max: 10 })
    .withMessage('Account number must be exactly 10 digits')
    .isNumeric()
    .withMessage('Account number must contain only numbers'),
  
  body('bankCode')
    .notEmpty()
    .withMessage('Bank code is required')
    .isLength({ min: 3, max: 3 })
    .withMessage('Bank code must be exactly 3 digits')
    .isNumeric()
    .withMessage('Bank code must contain only numbers'),
  validate
];

/**
 * Farmer payment account setup validation rules
 */
const validateFarmerPaymentSetup = [
  body('businessName')
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters')
    .trim(),
  
  body('bankAccount.bankName')
    .notEmpty()
    .withMessage('Bank name is required'),
  
  body('bankAccount.bankCode')
    .notEmpty()
    .withMessage('Bank code is required')
    .isLength({ min: 3, max: 3 })
    .withMessage('Bank code must be exactly 3 digits')
    .isNumeric()
    .withMessage('Bank code must contain only numbers'),
  
  body('bankAccount.accountNumber')
    .notEmpty()
    .withMessage('Account number is required')
    .isLength({ min: 10, max: 10 })
    .withMessage('Account number must be exactly 10 digits')
    .isNumeric()
    .withMessage('Account number must contain only numbers'),
  
  body('percentageCharge')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Percentage charge must be between 0 and 100'),
  validate
];

/**
 * Payment initialization validation rules
 */
const validatePaymentInitialization = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1 GHS'),
  
  body('farmerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid farmer ID format'),
  
  body('orderId')
    .optional()
    .isMongoId()
    .withMessage('Invalid order ID format'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
  validate
];

/**
 * Refund request validation rules
 */
const validateRefundRequest = [
  body('transactionId')
    .notEmpty()
    .withMessage('Transaction ID is required')
    .isMongoId()
    .withMessage('Invalid transaction ID format'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Refund amount must be at least 0.01 GHS'),
  
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
    .trim(),
  validate
];

/**
 * Payment link creation validation rules
 */
const validatePaymentLinkCreation = [
  body('name')
    .notEmpty()
    .withMessage('Payment link name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1 GHS'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiration date format'),
  validate
];

/**
 * Farmer registration validation (enhanced for payment info)
 */
const validateFarmerRegistration = [
  ...registerValidation,
  
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^0\d{9}$/)
    .withMessage('Phone number must start with 0 and be 10 digits'),
  
  body('farm.farmName')
    .notEmpty()
    .withMessage('Farm name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Farm name must be between 2 and 100 characters')
    .trim(),
  
  body('farm.location.region')
    .notEmpty()
    .withMessage('Region is required'),
  
  body('farm.location.district')
    .notEmpty()
    .withMessage('District is required'),
  
  body('farm.size.value')
    .notEmpty()
    .withMessage('Farm size is required')
    .isFloat({ min: 0.1 })
    .withMessage('Farm size must be at least 0.1'),
  
  body('farm.primaryCrops')
    .isArray({ min: 1 })
    .withMessage('At least one primary crop is required'),
  
  body('farm.yearsOfExperience')
    .notEmpty()
    .withMessage('Years of experience is required')
    .isInt({ min: 0, max: 100 })
    .withMessage('Years of experience must be between 0 and 100'),
  
  body('farm.ownershipStatus')
    .notEmpty()
    .withMessage('Ownership status is required'),
  
  // Payment setup validation (optional during registration)
  body('businessProfile.paymentMethods')
    .optional()
    .isArray()
    .withMessage('Payment methods must be an array'),
  
  body('businessProfile.accountDetails.bankAccounts')
    .optional()
    .isArray()
    .withMessage('Bank accounts must be an array'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  validateBankAccount,
  validateFarmerPaymentSetup,
  validatePaymentInitialization,
  validateRefundRequest,
  validatePaymentLinkCreation,
  validateFarmerRegistration
}; 