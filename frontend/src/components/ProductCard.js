import React, { useState } from 'react';
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, EyeIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';

// Product Card Component
const ProductCard = ({ product }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-sm ${
              i < rating ? 'text-orange-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100">
      <div className="relative p-6 bg-gray-50">
        {/* Sale Badge */}
        {product.isOnSale && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded z-10">
            Sale {product.salePercentage}
          </span>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200"
          >
            {isFavorite ? (
              <HeartSolid className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => setShowQuickView(!showQuickView)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200"
          >
            <EyeIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Product Image */}
        <div className="h-40 flex items-center justify-center mb-4">
          <img 
            src={product.image} 
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm">{product.name}</h3>
        
        {/* Rating */}
        <div className="mb-3">
          {renderStars(product.rating || 4)}
        </div>

        {/* Price and Cart */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-800">{product.price}</span>
          
          {/* Add to Cart Button */}
          {product.hasAddToCart ? (
            <button className="bg-primary hover:bg-secondary text-white p-2 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg">
              <ShoppingBagIcon className="w-4 h-4" />
            </button>
          ) : (
            <button className="p-2 border border-gray-300 rounded-full hover:border-primary transition-colors duration-200 group/cart">
              <ShoppingCartIcon className="w-4 h-4 text-gray-600 group-hover/cart:text-primary" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;