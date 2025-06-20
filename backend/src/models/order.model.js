const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    quantity: {
      value: {
        type: Number,
        required: true,
        min: [0, 'Quantity cannot be negative']
      },
      unit: {
        type: String,
        required: true,
        enum: ['kg', 'tons', 'bags', 'pieces', 'crates', 'boxes']
      }
    },
    pricePerUnit: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'ready_for_pickup',
      'in_transit',
      'delivered',
      'completed',
      'cancelled',
      'disputed'
    ],
    default: 'pending'
  },
  paymentDetails: {
    method: {
      type: String,
      enum: ['mobile_money', 'bank_transfer', 'cash_on_delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAmount: Number,
    paidAt: Date,
    provider: {
      type: String,
      enum: ['MTN', 'Vodafone', 'AirtelTigo', 'Bank', 'Other']
    }
  },
  delivery: {
    method: {
      type: String,
      enum: ['pickup', 'delivery'],
      required: true
    },
    address: {
      region: {
        type: String,
        required: true,
        enum: [
          'Greater Accra',
          'Ashanti',
          'Central',
          'Eastern',
          'Northern',
          'Western',
          'Volta',
          'Brong-Ahafo',
          'Upper East',
          'Upper West'
        ]
      },
      district: {
        type: String,
        required: true
      },
      community: String,
      streetAddress: String,
      landmark: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    contact: {
      name: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      alternatePhone: String
    },
    instructions: String,
    preferredDate: Date,
    actualDeliveryDate: Date,
    trackingNumber: String,
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: [
        'pending',
        'assigned',
        'picked_up',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'failed'
      ],
      default: 'pending'
    },
    cost: Number
  },
  timeline: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: [{
    content: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    type: {
      type: String,
      enum: ['invoice', 'receipt', 'delivery_note', 'other'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    reason: String,
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'closed']
    },
    openedAt: Date,
    resolvedAt: Date,
    resolution: String
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ buyer: 1 });
orderSchema.index({ 'items.farmer': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'delivery.provider': 1 });

// Generate unique order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    // Generate order number: AG + YEAR + MONTH + Random 4 digits
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `AG${year}${month}${random}`;
  }
  next();
});

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => total + item.subtotal, 0);
  }
  next();
});

// Add status change to timeline
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Order status changed to ${this.status}`
    });
  }
  next();
});

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  const nonCancellableStatuses = ['in_transit', 'delivered', 'completed', 'cancelled'];
  return !nonCancellableStatuses.includes(this.status);
};

// Method to check if order needs attention
orderSchema.methods.needsAttention = function() {
  const attentionStatuses = ['disputed', 'failed'];
  return attentionStatuses.includes(this.status) || this.dispute.isDisputed;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 