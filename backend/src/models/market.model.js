const mongoose = require('mongoose');

// Market Price Schema
const marketPriceSchema = new mongoose.Schema({
  product: {
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
    variety: String
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
    district: String,
    market: String
  },
  price: {
    current: {
      type: Number,
      required: [true, 'Current price is required'],
      min: [0, 'Price cannot be negative']
    },
    previous: Number,
    unit: {
      type: String,
      required: [true, 'Price unit is required'],
      enum: ['per_kg', 'per_ton', 'per_bag', 'per_piece', 'per_crate', 'per_box']
    },
    currency: {
      type: String,
      default: 'GHS'
    }
  },
  trends: {
    dailyChange: {
      value: Number,
      percentage: Number
    },
    weeklyChange: {
      value: Number,
      percentage: Number
    },
    monthlyChange: {
      value: Number,
      percentage: Number
    }
  },
  supply: {
    available: {
      type: Number,
      required: true,
      min: [0, 'Supply cannot be negative']
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'tons', 'bags', 'pieces', 'crates', 'boxes']
    },
    trend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable'],
      default: 'stable'
    }
  },
  demand: {
    level: {
      type: String,
      enum: ['very_low', 'low', 'moderate', 'high', 'very_high'],
      default: 'moderate'
    },
    trend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable'],
      default: 'stable'
    }
  },
  quality: {
    grade: {
      type: String,
      enum: ['A', 'B', 'C'],
      required: true
    },
    description: String
  },
  metadata: {
    dataSource: {
      type: String,
      enum: ['manual', 'automated', 'external_api', 'farmer_report'],
      default: 'manual'
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    },
    lastVerified: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
marketPriceSchema.index({ 'product.name': 1, 'location.region': 1, createdAt: -1 });
marketPriceSchema.index({ 'product.category': 1, 'location.region': 1 });
marketPriceSchema.index({ createdAt: -1 });

// Market Alert Schema
const marketAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    name: {
      type: String,
      required: true
    },
    category: String
  },
  location: {
    region: String,
    district: String
  },
  alertType: {
    type: String,
    enum: ['price_increase', 'price_decrease', 'supply_increase', 'supply_decrease', 'demand_change'],
    required: true
  },
  threshold: {
    value: {
      type: Number,
      required: true
    },
    operator: {
      type: String,
      enum: ['greater_than', 'less_than', 'percentage_change'],
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: Date,
  triggerCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create models
const MarketPrice = mongoose.model('MarketPrice', marketPriceSchema);
const MarketAlert = mongoose.model('MarketAlert', marketAlertSchema);

module.exports = {
  MarketPrice,
  MarketAlert
}; 