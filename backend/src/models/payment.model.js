const mongoose = require('mongoose');

// Farmer Payment Account Schema
const farmerPaymentAccountSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  subaccountCode: {
    type: String,
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true
  },
  bankAccount: {
    bankName: {
      type: String,
      required: true
    },
    bankCode: {
      type: String,
      required: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    accountName: {
      type: String,
      required: true
    }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  percentageCharge: {
    type: Number,
    default: 10, // Platform commission percentage
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paystackData: {
    type: mongoose.Schema.Types.Mixed // Store Paystack response data
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['business_registration', 'bank_statement', 'identity_document', 'other']
    },
    url: String,
    fileName: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  notes: String,
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalTransactions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Payment Transaction Schema
const paymentTransactionSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subaccountCode: String,
  email: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'GHS'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'abandoned', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    channel: String, // card, bank, ussd, qr, mobile_money, bank_transfer
    bank: String,
    cardType: String,
    last4: String,
    authorizationCode: String
  },
  platformFee: {
    type: Number,
    default: 0
  },
  farmerAmount: {
    type: Number,
    default: 0
  },
  paystackFee: {
    type: Number,
    default: 0
  },
  gatewayResponse: String,
  paidAt: Date,
  failureReason: String,
  ipAddress: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  paystackData: {
    type: mongoose.Schema.Types.Mixed // Store full Paystack response
  },
  // Split payment details
  splits: [{
    subaccountCode: String,
    amount: Number,
    share: Number // percentage
  }],
  // Webhook events
  webhookEvents: [{
    event: String,
    data: mongoose.Schema.Types.Mixed,
    receivedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Refund Schema
const refundSchema = new mongoose.Schema({
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentTransaction',
    required: true
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  reason: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed'],
    default: 'pending'
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerNote: String,
  merchantNote: String,
  processedAt: Date,
  paystackData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Payment Link Schema (for farmers to create payment links)
const paymentLinkSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'GHS'
  },
  slug: {
    type: String,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paystackUrl: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  totalPayments: {
    type: Number,
    default: 0
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes for better performance
farmerPaymentAccountSchema.index({ farmerId: 1 });
farmerPaymentAccountSchema.index({ subaccountCode: 1 });
farmerPaymentAccountSchema.index({ 'bankAccount.accountNumber': 1 });

paymentTransactionSchema.index({ reference: 1 });
paymentTransactionSchema.index({ buyerId: 1 });
paymentTransactionSchema.index({ farmerId: 1 });
paymentTransactionSchema.index({ status: 1 });
paymentTransactionSchema.index({ createdAt: -1 });
paymentTransactionSchema.index({ orderId: 1 });

refundSchema.index({ transactionId: 1 });
refundSchema.index({ reference: 1 });
refundSchema.index({ status: 1 });

paymentLinkSchema.index({ farmerId: 1 });
paymentLinkSchema.index({ slug: 1 });
paymentLinkSchema.index({ isActive: 1 });

// Middleware to update farmer earnings when a transaction is successful
paymentTransactionSchema.post('save', async function(doc) {
  if (doc.status === 'success' && doc.farmerId && doc.farmerAmount > 0) {
    try {
      await FarmerPaymentAccount.findOneAndUpdate(
        { farmerId: doc.farmerId },
        {
          $inc: {
            totalEarnings: doc.farmerAmount,
            totalTransactions: 1
          }
        }
      );
    } catch (error) {
      console.error('Error updating farmer earnings:', error);
    }
  }
});

// Models
const FarmerPaymentAccount = mongoose.model('FarmerPaymentAccount', farmerPaymentAccountSchema);
const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);
const Refund = mongoose.model('Refund', refundSchema);
const PaymentLink = mongoose.model('PaymentLink', paymentLinkSchema);

module.exports = {
  FarmerPaymentAccount,
  PaymentTransaction,
  Refund,
  PaymentLink
}; 