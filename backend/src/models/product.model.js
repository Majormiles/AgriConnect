const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Cereals',
      'Tubers',
      'Vegetables',
      'Fruits',
      'Legumes',
      'Cash Crops',
      'Livestock',
      'Poultry',
      'Fish',
      'Other'
    ]
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  quantity: {
    value: {
      type: Number,
      required: [true, 'Quantity value is required'],
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      enum: ['kg', 'tons', 'bags', 'pieces', 'crates', 'boxes']
    }
  },
  price: {
    value: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Price unit is required'],
      enum: ['per_kg', 'per_ton', 'per_bag', 'per_piece', 'per_crate', 'per_box']
    }
  },
  location: {
    region: {
      type: String,
      required: [true, 'Region is required'],
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
      required: [true, 'District is required']
    },
    community: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  images: [{
    url: String,
    caption: String
  }],
  quality: {
    grade: {
      type: String,
      enum: ['A', 'B', 'C'],
      required: [true, 'Quality grade is required']
    },
    description: String
  },
  availability: {
    from: {
      type: Date,
      required: [true, 'Availability start date is required']
    },
    to: {
      type: Date,
      required: [true, 'Availability end date is required']
    },
    status: {
      type: String,
      enum: ['available', 'limited', 'out_of_stock'],
      default: 'available'
    }
  },
  harvest: {
    date: {
      type: Date,
      required: [true, 'Harvest date is required']
    },
    season: {
      type: String,
      enum: ['major', 'minor'],
      required: [true, 'Harvest season is required']
    }
  },
  certification: [{
    type: {
      type: String,
      enum: ['Organic', 'Fair Trade', 'GlobalGAP', 'Other']
    },
    issuer: String,
    validUntil: Date,
    documentUrl: String
  }],
  storage: {
    type: {
      type: String,
      enum: ['Warehouse', 'Cold Storage', 'On Farm', 'Other']
    },
    conditions: String
  },
  minimumOrder: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'tons', 'bags', 'pieces', 'crates', 'boxes']
    }
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'suspended', 'archived'],
    default: 'pending'
  },
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  moderatedAt: Date,
  views: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  metadata: {
    isOrganic: {
      type: Boolean,
      default: false
    },
    isFairTrade: {
      type: Boolean,
      default: false
    },
    isLocallySourced: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Create indexes for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ 'location.region': 1, 'location.district': 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ 'availability.status': 1 });
productSchema.index({ status: 1 });

// Calculate average rating before saving
productSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
  }
  next();
});

// Virtual for total reviews count
productSchema.virtual('totalReviews').get(function() {
  return this.ratings ? this.ratings.length : 0;
});

// Method to check if product is available
productSchema.methods.isAvailable = function() {
  const now = new Date();
  return (
    this.availability.status === 'available' &&
    now >= this.availability.from &&
    now <= this.availability.to &&
    this.quantity.value > 0
  );
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 