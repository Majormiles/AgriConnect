const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8
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
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  permissions: [{
    module: {
      type: String,
      enum: ['users', 'products', 'orders', 'logistics', 'analytics', 'disputes', 'system']
    },
    actions: [{
      type: String,
      enum: ['read', 'write', 'delete', 'approve', 'moderate']
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  profile: {
    avatar: String,
    phone: String,
    department: String,
    notes: String
  }
}, {
  timestamps: true
});

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isLocked) {
    throw new Error('Account is temporarily locked');
  }
  
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  
  if (!isMatch) {
    this.loginAttempts = this.loginAttempts + 1;
    
    // Lock account after 5 failed attempts for 1 hour
    if (this.loginAttempts >= 5) {
      this.lockUntil = Date.now() + (60 * 60 * 1000); // 1 hour
    }
    
    await this.save();
    throw new Error('Invalid password');
  }
  
  // Reset login attempts on successful login
  if (this.loginAttempts > 0) {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
  }
  
  this.lastLogin = new Date();
  await this.save();
  
  return isMatch;
};

// Check permissions method
adminSchema.methods.hasPermission = function(module, action) {
  if (this.role === 'super_admin') return true;
  
  const modulePermission = this.permissions.find(p => p.module === module);
  return modulePermission && modulePermission.actions.includes(action);
};

// Default permissions for admin role
adminSchema.methods.setDefaultPermissions = function() {
  this.permissions = [
    { module: 'users', actions: ['read', 'write', 'approve'] },
    { module: 'products', actions: ['read', 'approve', 'moderate'] },
    { module: 'orders', actions: ['read', 'write'] },
    { module: 'logistics', actions: ['read', 'write'] },
    { module: 'analytics', actions: ['read'] },
    { module: 'disputes', actions: ['read', 'write', 'moderate'] }
  ];
};

// Indexes
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin; 