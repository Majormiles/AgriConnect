const { FarmerPaymentAccount, PaymentTransaction, Refund, PaymentLink } = require('../models/payment.model');
const User = require('../models/user.model');
const paystackService = require('../services/paystack.service');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');

/**
 * Get supported Ghana banks from Paystack
 * @route GET /api/payments/banks
 * @access Public
 */
const getBanks = catchAsync(async (req, res) => {
  const result = await paystackService.getGhanaBanks();
  
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error
    });
  }

  res.status(200).json({
    success: true,
    data: result.banks,
    count: result.count
  });
});

/**
 * Get Ghana mobile money providers
 * @route GET /api/payments/mobile-money-providers
 * @access Public
 */
const getMobileMoneyProviders = catchAsync(async (req, res) => {
  const providers = paystackService.getMobileMoneyProviders();
  
  res.status(200).json({
    success: true,
    data: providers
  });
});

/**
 * Validate Ghana phone number
 * @route POST /api/payments/validate-phone
 * @access Public
 */
const validatePhoneNumber = catchAsync(async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  const validation = paystackService.validateGhanaPhoneNumber(phoneNumber);
  
  res.status(200).json({
    success: true,
    data: validation
  });
});

/**
 * Verify bank account details
 * @route POST /api/payments/verify-bank-account
 * @access Private (Farmers)
 */
const verifyBankAccount = catchAsync(async (req, res) => {
  const { accountNumber, bankCode } = req.body;

  if (!accountNumber || !bankCode) {
    return res.status(400).json({
      success: false,
      message: 'Account number and bank code are required'
    });
  }

  const result = await paystackService.verifyBankAccount(accountNumber, bankCode);
  
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error
    });
  }

  res.status(200).json({
    success: true,
    data: {
      accountName: result.accountName,
      accountNumber: result.accountNumber,
      bankId: result.bankId
    }
  });
});

/**
 * Create farmer payment account (subaccount)
 * @route POST /api/payments/farmer/setup-account
 * @access Private (Farmers only)
 */
const setupFarmerPaymentAccount = catchAsync(async (req, res) => {
  const farmerId = req.user.id;
  const {
    businessName,
    paymentAccount,
    percentageCharge,
    ghanaCardNumber,
    tinNumber
  } = req.body;

  // Validate farmer role
  if (req.user.role !== 'farmer') {
    return res.status(403).json({
      success: false,
      message: 'Only farmers can set up payment accounts'
    });
  }

  // Check if farmer already has a payment account
  const existingAccount = await FarmerPaymentAccount.findOne({ farmerId });
  if (existingAccount) {
    return res.status(400).json({
      success: false,
      message: 'Payment account already exists for this farmer'
    });
  }

  // Validate payment method
  if (!paymentAccount || !paymentAccount.method) {
    return res.status(400).json({
      success: false,
      message: 'Payment account method is required'
    });
  }

  let verificationResult = {};

  // Verify account based on payment method
  if (paymentAccount.method === 'bank') {
    if (!paymentAccount.bankAccount) {
      return res.status(400).json({
        success: false,
        message: 'Bank account details are required for bank payment method'
      });
    }

    const bankVerification = await paystackService.verifyBankAccount(
      paymentAccount.bankAccount.accountNumber,
      paymentAccount.bankAccount.bankCode
    );

    if (!bankVerification.success) {
      return res.status(400).json({
        success: false,
        message: 'Bank account verification failed: ' + bankVerification.error
      });
    }

    paymentAccount.bankAccount.accountName = bankVerification.accountName;
    verificationResult = bankVerification;

  } else if (paymentAccount.method === 'mobile_money') {
    if (!paymentAccount.mobileMoneyAccount || !paymentAccount.mobileMoneyAccount.phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Mobile money phone number is required for mobile money payment method'
      });
    }

    // Validate Ghana phone number
    const phoneValidation = paystackService.validateGhanaPhoneNumber(
      paymentAccount.mobileMoneyAccount.phoneNumber
    );

    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ghana phone number format'
      });
    }

    paymentAccount.mobileMoneyAccount.provider = phoneValidation.provider;
    verificationResult = phoneValidation;
  }

  // Create Paystack subaccount
  const subaccountData = {
    businessName,
    email: req.user.email,
    paymentAccount,
    phoneNumber: req.user.phoneNumber,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    farmerId,
    percentageCharge: percentageCharge || 10,
    ghanaCardNumber,
    tinNumber
  };

  const subaccountResult = await paystackService.createFarmerSubaccount(subaccountData);

  if (!subaccountResult.success) {
    return res.status(400).json({
      success: false,
      message: 'Failed to create payment account: ' + subaccountResult.error
    });
  }

  // Save to database
  const farmerPaymentAccount = new FarmerPaymentAccount({
    farmerId,
    subaccountCode: subaccountResult.subaccountCode,
    businessName,
    paymentMethod: paymentAccount.method,
    bankAccount: paymentAccount.method === 'bank' ? paymentAccount.bankAccount : undefined,
    mobileMoneyAccount: paymentAccount.method === 'mobile_money' ? paymentAccount.mobileMoneyAccount : undefined,
    ghanaCardNumber,
    tinNumber,
    percentageCharge: percentageCharge || 10,
    paystackData: subaccountResult.data,
    verificationStatus: 'pending'
  });

  await farmerPaymentAccount.save();

  res.status(201).json({
    success: true,
    message: 'Payment account created successfully',
    data: {
      subaccountCode: subaccountResult.subaccountCode,
      businessName,
      paymentMethod: paymentAccount.method,
      verificationStatus: 'pending',
      percentageCharge: percentageCharge || 10
    }
  });
});

/**
 * Get farmer payment account details
 * @route GET /api/payments/farmer/account
 * @access Private (Farmers only)
 */
const getFarmerPaymentAccount = catchAsync(async (req, res) => {
  const farmerId = req.user.id;

  const paymentAccount = await FarmerPaymentAccount.findOne({ farmerId });
  if (!paymentAccount) {
    return res.status(404).json({
      success: false,
      message: 'Payment account not found'
    });
  }

  res.status(200).json({
    success: true,
    data: paymentAccount
  });
});

/**
 * Initialize payment for buyer
 * @route POST /api/payments/initialize
 * @access Private (Buyers)
 */
const initializePayment = catchAsync(async (req, res) => {
  const buyerId = req.user.id;
  const {
    amount,
    farmerId,
    orderId,
    paymentMethod = 'card',
    mobileMoneyProvider,
    phoneNumber,
    metadata = {}
  } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid amount is required'
    });
  }

  // Validate mobile money requirements
  if (paymentMethod === 'mobile_money') {
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required for mobile money payments'
      });
    }

    const phoneValidation = paystackService.validateGhanaPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ghana phone number format'
      });
    }

    if (!mobileMoneyProvider) {
      return res.status(400).json({
        success: false,
        message: 'Mobile money provider is required'
      });
    }
  }

  // Get farmer's payment account if farmerId is provided
  let subaccountCode = null;
  if (farmerId) {
    const farmerAccount = await FarmerPaymentAccount.findOne({ 
      farmerId,
      verificationStatus: 'verified',
      isActive: true
    });
    
    if (!farmerAccount) {
      return res.status(400).json({
        success: false,
        message: 'Farmer payment account not found or not verified'
      });
    }
    
    subaccountCode = farmerAccount.subaccountCode;
  }

  // Generate unique reference
  const reference = `AGC_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  // Initialize payment with Paystack
  const paymentData = {
    email: req.user.email,
    amount,
    orderReference: reference,
    subaccountCode,
    metadata: {
      ...metadata,
      buyer_id: buyerId,
      farmer_id: farmerId,
      order_id: orderId
    }
  };

  const result = await paystackService.initializePayment(paymentData);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error
    });
  }

  // Calculate split amounts
  const platformFeePercentage = subaccountCode ? 10 : 2.5; // Higher fee for split payments
  const platformFee = (amount * platformFeePercentage) / 100;
  const farmerAmount = subaccountCode ? amount - platformFee : 0;

  // Save transaction to database
  const transaction = new PaymentTransaction({
    reference,
    orderId,
    buyerId,
    farmerId,
    subaccountCode,
    email: req.user.email,
    amount,
    platformFee,
    farmerAmount,
    status: 'pending',
    metadata: paymentData.metadata,
    paystackData: result.data,
    ipAddress: req.ip
  });

  await transaction.save();

  res.status(200).json({
    success: true,
    data: {
      authorizationUrl: result.authorizationUrl,
      accessCode: result.accessCode,
      reference: result.reference
    }
  });
});

/**
 * Verify payment transaction
 * @route GET /api/payments/verify/:reference
 * @access Private
 */
const verifyPayment = catchAsync(async (req, res) => {
  const { reference } = req.params;

  // Find transaction in database
  const transaction = await PaymentTransaction.findOne({ reference });
  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Verify with Paystack
  const result = await paystackService.verifyPayment(reference);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error
    });
  }

  // Update transaction status
  transaction.status = result.status;
  transaction.paymentMethod = {
    channel: result.data.channel,
    bank: result.data.bank,
    cardType: result.data.card_type,
    last4: result.data.last4,
    authorizationCode: result.data.authorization?.authorization_code
  };
  transaction.paidAt = result.paidAt;
  transaction.gatewayResponse = result.data.gateway_response;
  transaction.paystackData = result.data;

  await transaction.save();

  res.status(200).json({
    success: true,
    data: {
      status: result.status,
      reference: result.reference,
      amount: result.amount,
      paidAt: result.paidAt,
      channel: result.channel
    }
  });
});

/**
 * Get payment transactions for a user
 * @route GET /api/payments/transactions
 * @access Private
 */
const getUserTransactions = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, status, type } = req.query;

  let query = {};
  
  // Determine query based on user role and type parameter
  if (type === 'purchases' || req.user.role === 'buyer') {
    query.buyerId = userId;
  } else if (type === 'sales' || req.user.role === 'farmer') {
    query.farmerId = userId;
  } else {
    // For admin or general query, include both
    query.$or = [{ buyerId: userId }, { farmerId: userId }];
  }

  if (status) {
    query.status = status;
  }

  const transactions = await PaymentTransaction.find(query)
    .populate('buyerId', 'firstName lastName email')
    .populate('farmerId', 'firstName lastName email farm.farmName')
    .populate('orderId')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await PaymentTransaction.countDocuments(query);

  res.status(200).json({
    success: true,
    data: transactions,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  });
});

/**
 * Handle Paystack webhook
 * @route POST /api/payments/webhook
 * @access Public (webhook)
 */
const handleWebhook = catchAsync(async (req, res) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body), 'utf-8')
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).json({
      success: false,
      message: 'Invalid signature'
    });
  }

  const event = req.body;
  
  try {
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;
      case 'transfer.success':
        await handleSuccessfulTransfer(event.data);
        break;
      case 'transfer.failed':
        await handleFailedTransfer(event.data);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    // Log webhook event
    const transaction = await PaymentTransaction.findOne({ 
      reference: event.data.reference 
    });
    
    if (transaction) {
      transaction.webhookEvents.push({
        event: event.event,
        data: event.data
      });
      await transaction.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

/**
 * Process refund request
 * @route POST /api/payments/refund
 * @access Private (Admin or transaction owner)
 */
const processRefund = catchAsync(async (req, res) => {
  const { transactionId, amount, reason } = req.body;
  const userId = req.user.id;

  const transaction = await PaymentTransaction.findById(transactionId);
  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Check if user has permission to refund
  const canRefund = req.user.role === 'admin' || 
                   transaction.buyerId.toString() === userId ||
                   transaction.farmerId?.toString() === userId;

  if (!canRefund) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to refund this transaction'
    });
  }

  if (transaction.status !== 'success') {
    return res.status(400).json({
      success: false,
      message: 'Only successful transactions can be refunded'
    });
  }

  // Process refund with Paystack
  const result = await paystackService.processRefund(
    transaction.reference,
    amount,
    reason
  );

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error
    });
  }

  // Create refund record
  const refund = new Refund({
    transactionId,
    reference: result.refundReference,
    amount: amount || transaction.amount,
    reason,
    status: result.status,
    initiatedBy: userId,
    customerNote: reason,
    paystackData: result.data
  });

  await refund.save();

  // Update transaction status if full refund
  if (!amount || amount >= transaction.amount) {
    transaction.status = 'refunded';
    await transaction.save();
  }

  res.status(200).json({
    success: true,
    message: 'Refund processed successfully',
    data: {
      refundReference: result.refundReference,
      status: result.status,
      amount: amount || transaction.amount
    }
  });
});

// Helper functions for webhook processing
const handleSuccessfulPayment = async (data) => {
  const transaction = await PaymentTransaction.findOne({ 
    reference: data.reference 
  });
  
  if (transaction && transaction.status === 'pending') {
    transaction.status = 'success';
    transaction.paidAt = new Date(data.paid_at);
    transaction.paystackData = data;
    await transaction.save();
  }
};

const handleFailedPayment = async (data) => {
  const transaction = await PaymentTransaction.findOne({ 
    reference: data.reference 
  });
  
  if (transaction && transaction.status === 'pending') {
    transaction.status = 'failed';
    transaction.failureReason = data.gateway_response;
    transaction.paystackData = data;
    await transaction.save();
  }
};

const handleSuccessfulTransfer = async (data) => {
  // Handle successful transfers (payouts to farmers)
  console.log('Transfer successful:', data);
};

const handleFailedTransfer = async (data) => {
  // Handle failed transfers
  console.log('Transfer failed:', data);
};

module.exports = {
  getBanks,
  getMobileMoneyProviders,
  validatePhoneNumber,
  verifyBankAccount,
  setupFarmerPaymentAccount,
  getFarmerPaymentAccount,
  initializePayment,
  verifyPayment,
  getUserTransactions,
  handleWebhook,
  processRefund
}; 