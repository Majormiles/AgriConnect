import React from 'react';
import ProductCard from './ProductCard';

// Featured Products Component
const FeaturedProducts = () => {
  const products = [
    { 
      name: 'Green Apple', 
      price: '199', 
      image: '/images/apple.png',
      rating: 4,
      isOnSale: true,
      salePercentage: '50%'
    },
    { 
      name: 'Chinese Cabbage', 
      price: '149', 
      image: '/images/cabbage.png',
      rating: 4
    },
    { 
      name: 'Green Capsicum', 
      price: '14.99', 
      image: '/images/greepepper.png',
      rating: 4,
      hasAddToCart: true
    },
    { 
      name: 'Ladies Finger', 
      price: '14.99', 
      image: '/images/okro.png',
      rating: 4
    }
  ];

  return (
    <section className="py-16 bg-gray-50 relative overflow-hidden">
      {/* Decorative leaves */}
      <div className="absolute top-10 left-10 w-12 h-12 text-green-200 opacity-30">🍃</div>
      <div className="absolute bottom-10 right-10 w-16 h-16 text-green-200 opacity-30 transform rotate-12">🍃</div>

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
          <button className="text-primary hover:text-secondary font-medium flex items-center space-x-1 transition-colors duration-200">
            <span>View All</span>
            <span className="text-lg">→</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard 
              key={index} 
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;