const mongoose = require('mongoose');
const Product = require('./src/models/product.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/agriconnect')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Sample products for testing
    const sampleProducts = [
      {
        name: 'Fresh Tomatoes',
        description: 'Premium quality fresh tomatoes, perfect for cooking and salads',
        category: 'Vegetables',
        subcategory: 'Fruits',
        price: { value: 8.50, unit: 'per_kg' },
        images: [{ url: '/images/shoproducts/tomato.png', alt: 'Fresh Tomatoes' }],
        farmer: new mongoose.Types.ObjectId(),
        location: { region: 'Greater Accra', district: 'Accra Metropolitan' },
        availability: { status: 'available', quantity: 100, unit: 'kg' },
        featured: true,
        averageRating: 4.5,
        totalReviews: 12,
        discount: 0,
        onSale: false
      },
      {
        name: 'Green Apples',
        description: 'Crispy and sweet green apples, locally grown',
        category: 'Fruits',
        subcategory: 'Citrus',
        price: { value: 12.00, unit: 'per_kg' },
        images: [{ url: '/images/shoproducts/greenapple.png', alt: 'Green Apples' }],
        farmer: new mongoose.Types.ObjectId(),
        location: { region: 'Ashanti', district: 'Kumasi Metropolitan' },
        availability: { status: 'available', quantity: 50, unit: 'kg' },
        featured: true,
        averageRating: 4.8,
        totalReviews: 25,
        discount: 15,
        onSale: true
      },
      {
        name: 'Fresh Corn',
        description: 'Sweet corn fresh from the farm',
        category: 'Cereals',
        subcategory: 'Maize',
        price: { value: 5.00, unit: 'per_kg' },
        images: [{ url: '/images/shoproducts/corn.png', alt: 'Fresh Corn' }],
        farmer: new mongoose.Types.ObjectId(),
        location: { region: 'Northern', district: 'Tamale Metropolitan' },
        availability: { status: 'available', quantity: 200, unit: 'kg' },
        featured: false,
        averageRating: 4.2,
        totalReviews: 8,
        discount: 20,
        onSale: true
      },
      {
        name: 'Red Chili Peppers',
        description: 'Hot and spicy red chili peppers',
        category: 'Vegetables',
        subcategory: 'Peppers',
        price: { value: 15.00, unit: 'per_kg' },
        images: [{ url: '/images/shoproducts/redchili.png', alt: 'Red Chili Peppers' }],
        farmer: new mongoose.Types.ObjectId(),
        location: { region: 'Volta', district: 'Ho Municipal' },
        availability: { status: 'available', quantity: 30, unit: 'kg' },
        featured: true,
        averageRating: 4.6,
        totalReviews: 15,
        discount: 0,
        onSale: false
      },
      {
        name: 'Fresh Meat',
        description: 'High quality fresh beef',
        category: 'Livestock',
        subcategory: 'Beef',
        price: { value: 35.00, unit: 'per_kg' },
        images: [{ url: '/images/shoproducts/meat.png', alt: 'Fresh Meat' }],
        farmer: new mongoose.Types.ObjectId(),
        location: { region: 'Upper East', district: 'Bolgatanga Municipal' },
        availability: { status: 'available', quantity: 20, unit: 'kg' },
        featured: false,
        averageRating: 4.4,
        totalReviews: 10,
        discount: 10,
        onSale: true
      },
      {
        name: 'Cooking Oil',
        description: 'Pure palm oil for cooking',
        category: 'Oil',
        subcategory: 'Palm Oil',
        price: { value: 25.00, unit: 'per_litre' },
        images: [{ url: '/images/shoproducts/oil.png', alt: 'Cooking Oil' }],
        farmer: new mongoose.Types.ObjectId(),
        location: { region: 'Western', district: 'Sekondi-Takoradi Metropolitan' },
        availability: { status: 'available', quantity: 40, unit: 'litres' },
        featured: false,
        averageRating: 4.3,
        totalReviews: 18,
        discount: 5,
        onSale: true
      },
      {
        name: 'Fresh Vegetables Mix',
        description: 'Mixed fresh vegetables bundle',
        category: 'Vegetables',
        subcategory: 'Leafy Greens',
        price: { value: 6.00, unit: 'per_bundle' },
        images: [{ url: '/images/shoproducts/freshvegitables.png', alt: 'Fresh Vegetables' }],
        farmer: new mongoose.Types.ObjectId(),
        location: { region: 'Eastern', district: 'Koforidua Municipal' },
        availability: { status: 'available', quantity: 80, unit: 'bundles' },
        featured: true,
        averageRating: 4.7,
        totalReviews: 22,
        discount: 0,
        onSale: false
      },
      {
        name: 'Eggplant',
        description: 'Fresh purple eggplant',
        category: 'Vegetables',
        subcategory: 'Fruits',
        price: { value: 10.00, unit: 'per_kg' },
        images: [{ url: '/images/shoproducts/eggplant.png', alt: 'Eggplant' }],
        farmer: new mongoose.Types.ObjectId(),
        location: { region: 'Central', district: 'Cape Coast Metropolitan' },
        availability: { status: 'available', quantity: 35, unit: 'kg' },
        featured: false,
        averageRating: 4.1,
        totalReviews: 7,
        discount: 12,
        onSale: true
      }
    ];

    // Clear existing products first
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log('Sample products created:', insertedProducts.length);
    
    mongoose.connection.close();
    console.log('Database connection closed');
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  }); 