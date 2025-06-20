const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const farmSchema = new mongoose.Schema({
  farmName: {
    type: String,
    required: [true, 'Farm name is required'],
    trim: true
  },
  location: {
    region: {
      type: String,
      required: [true, 'Region is required'],
      enum: ['Greater Accra', 'Ashanti', 'Central', 'Eastern', 'Northern', 'Western', 'Volta', 'Brong-Ahafo', 'Upper East', 'Upper West']
    },
    district: {
      type: String,
      required: [true, 'District is required']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  size: {
    value: {
      type: Number,
      required: [true, 'Farm size is required']
    },
    unit: {
      type: String,
      enum: ['acres', 'hectares'],
      default: 'acres'
    }
  },
  crops: [{
    name: {
      type: String,
      required: true
    },
    variety: String,
    plantingDate: Date,
    expectedHarvestDate: Date,
    quantity: Number,
    unit: String
  }],
  soilType: String,
  irrigationMethod: String,
  certifications: [{
    type: String,
    name: String,
    issueDate: Date,
    expiryDate: Date,
    certificationBody: String
  }]
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'farmer', 'buyer', 'supplier', 'logistics', 'admin'],
    default: 'user'
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^0\d{9}$/, 'Please provide a valid phone number starting with 0 followed by 9 digits']
  },
  language: {
    type: String,
    enum: ['en', 'tw', 'ha', 'ga'],
    default: 'en'
  },
  // Farmer specific fields
  farm: farmSchema,
  // Business fields
  businessProfile: {
    businessName: String,
    registrationNumber: String,
    taxId: String,
    businessAddress: String,
    businessType: {
      type: String,
      enum: ['retailer', 'wholesaler', 'processor', 'exporter', 'restaurant', 'hotel', 'other']
    },
    purchasingCapacity: String,
    preferredCrops: [String]
  },
  
  // Supplier specific fields
  supplierProfile: {
    supplyCategories: [{
      type: String,
      enum: ['seeds', 'fertilizers', 'pesticides', 'equipment', 'tools', 'other']
    }],
    serviceAreas: [String],
    businessLicense: String,
    certifications: [String]
  },
  
  // Logistics provider fields
  logisticsProfile: {
    vehicleTypes: [{
      type: String,
      enum: ['truck', 'van', 'motorcycle', 'bicycle', 'other']
    }],
    capacity: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'tons']
      }
    },
    coverageAreas: [String],
    licenseNumber: String,
    insuranceInfo: String
  },
  // Dashboard preferences
  dashboardPreferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      orderUpdates: {
        type: Boolean,
        default: true
      },
      marketPrices: {
        type: Boolean,
        default: true
      },
      weatherAlerts: {
        type: Boolean,
        default: true
      }
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  verification: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    notes: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for verification tokens
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password is correct
userSchema.methods.isPasswordMatch = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Method to get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Method to check if user is a farmer
userSchema.methods.isFarmer = function() {
  return this.role === 'farmer';
};

const User = mongoose.model('User', userSchema);

module.exports = User; 