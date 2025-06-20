const mongoose = require('mongoose');

const logisticsSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: {
      type: String,
      required: true,
      enum: ['Truck', 'Van', 'Motorcycle', 'Bicycle', 'Other']
    },
    registrationNumber: {
      type: String,
      required: true
    },
    capacity: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        required: true,
        enum: ['kg', 'tons']
      }
    },
    features: [{
      type: String,
      enum: ['Refrigerated', 'Temperature Controlled', 'GPS Tracking', 'Loading Equipment']
    }]
  },
  coverage: {
    regions: [{
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
    }],
    districts: [{
      region: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      }
    }]
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'offline', 'maintenance'],
      default: 'available'
    },
    schedule: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      startTime: String,
      endTime: String
    }],
    customOffDays: [{
      date: Date,
      reason: String
    }]
  },
  currentLocation: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    address: {
      region: String,
      district: String,
      community: String
    }
  },
  activeDeliveries: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    status: {
      type: String,
      enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'failed'],
      default: 'assigned'
    },
    pickupLocation: {
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      address: {
        region: String,
        district: String,
        community: String,
        details: String
      }
    },
    dropoffLocation: {
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      address: {
        region: String,
        district: String,
        community: String,
        details: String
      }
    },
    timeline: [{
      status: String,
      location: {
        coordinates: {
          latitude: Number,
          longitude: Number
        },
        address: String
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      note: String
    }]
  }],
  ratings: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  performance: {
    totalDeliveries: {
      type: Number,
      default: 0
    },
    successfulDeliveries: {
      type: Number,
      default: 0
    },
    failedDeliveries: {
      type: Number,
      default: 0
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 0
    },
    averageDeliveryTime: {
      type: Number, // in minutes
      default: 0
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['vehicle_registration', 'insurance', 'license', 'permit', 'other'],
      required: true
    },
    number: String,
    issueDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['valid', 'expired', 'pending'],
      default: 'valid'
    },
    url: String
  }],
  preferences: {
    maxDistance: {
      value: Number,
      unit: {
        type: String,
        enum: ['km', 'miles']
      }
    },
    maxWeight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'tons']
      }
    },
    productTypes: [{
      type: String,
      enum: ['Fresh Produce', 'Grains', 'Livestock', 'Processed Foods', 'Other']
    }],
    autoAssign: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active'
  },
  metadata: {
    registeredAt: {
      type: Date,
      default: Date.now
    },
    lastActive: Date,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
logisticsSchema.index({ 'provider': 1 });
logisticsSchema.index({ 'coverage.regions': 1 });
logisticsSchema.index({ 'availability.status': 1 });
logisticsSchema.index({ 'vehicle.registrationNumber': 1 });
logisticsSchema.index({ 'currentLocation.coordinates': '2dsphere' });

// Calculate average rating before saving
logisticsSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
  }
  next();
});

// Update performance metrics when adding new delivery
logisticsSchema.methods.updatePerformanceMetrics = function() {
  const totalDeliveries = this.activeDeliveries.length;
  const successfulDeliveries = this.activeDeliveries.filter(
    delivery => delivery.status === 'delivered'
  ).length;
  const failedDeliveries = this.activeDeliveries.filter(
    delivery => delivery.status === 'failed'
  ).length;

  this.performance = {
    totalDeliveries,
    successfulDeliveries,
    failedDeliveries,
    onTimeDeliveryRate: (successfulDeliveries / totalDeliveries) * 100,
    averageDeliveryTime: this.calculateAverageDeliveryTime()
  };
};

// Calculate average delivery time
logisticsSchema.methods.calculateAverageDeliveryTime = function() {
  const completedDeliveries = this.activeDeliveries.filter(
    delivery => delivery.status === 'delivered'
  );

  if (completedDeliveries.length === 0) return 0;

  const totalTime = completedDeliveries.reduce((sum, delivery) => {
    const start = delivery.timeline[0].timestamp;
    const end = delivery.timeline[delivery.timeline.length - 1].timestamp;
    return sum + (end - start);
  }, 0);

  return totalTime / completedDeliveries.length / (1000 * 60); // Convert to minutes
};

// Check if provider is available for new delivery
logisticsSchema.methods.isAvailableForDelivery = function() {
  return (
    this.status === 'active' &&
    this.availability.status === 'available' &&
    this.activeDeliveries.length < 5 // Maximum concurrent deliveries
  );
};

const Logistics = mongoose.model('Logistics', logisticsSchema);

module.exports = Logistics; 