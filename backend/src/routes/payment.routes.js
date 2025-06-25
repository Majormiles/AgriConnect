const express = require('express');
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const rateLimiter = require('../middleware/rate-limiter.middleware');

const router = express.Router();

// Public routes
router.get('/banks', paymentController.getBanks);
router.get('/mobile-money-providers', paymentController.getMobileMoneyProviders);
router.post('/validate-phone', paymentController.validatePhoneNumber);
router.post('/webhook', paymentController.handleWebhook);

// Protected routes (require authentication)
router.use(authMiddleware.protect);

// Bank account verification
router.post('/verify-bank-account', 
  validationMiddleware.validateBankAccount,
  paymentController.verifyBankAccount
);

// Farmer-specific routes
router.post('/farmer/setup-account',
  rateLimiter.createAccountLimiter,
  validationMiddleware.validateFarmerPaymentSetup,
  paymentController.setupFarmerPaymentAccount
);

router.get('/farmer/account', paymentController.getFarmerPaymentAccount);

// Payment initialization and verification
router.post('/initialize',
  rateLimiter.paymentLimiter,
  validationMiddleware.validatePaymentInitialization,
  paymentController.initializePayment
);

router.get('/verify/:reference', paymentController.verifyPayment);

// Transaction management
router.get('/transactions', paymentController.getUserTransactions);

// Refund processing
router.post('/refund',
  validationMiddleware.validateRefundRequest,
  paymentController.processRefund
);

module.exports = router; 