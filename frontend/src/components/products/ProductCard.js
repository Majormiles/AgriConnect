import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const ProductCard = ({ product, isFarmer }) => {
  const {
    _id,
    name,
    images,
    price,
    location,
    farmer,
    quantity,
    availability,
    averageRating,
    createdAt
  } = product;

  // Function to render star rating
  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;

    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }

    return stars;
  };

  // Function to format price
  const formatPrice = (priceValue, unit) => {
    return `GH₵ ${priceValue.toFixed(2)} / ${unit.replace('per_', '')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={images[0]?.url || '/images/placeholder.png'}
          alt={name}
          className="w-full h-full object-cover"
        />
        {availability.status !== 'available' && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-sm">
            {availability.status}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {name}
          </h3>
          <span className="text-sm text-gray-500">
            {formatDistance(new Date(createdAt), new Date(), { addSuffix: true })}
          </span>
        </div>

        <div className="flex items-center mb-2">
          {renderStars(averageRating)}
          <span className="ml-1 text-sm text-gray-600">
            ({averageRating.toFixed(1)})
          </span>
        </div>

        <div className="text-lg font-bold text-green-600 mb-2">
          {formatPrice(price.value, price.unit)}
        </div>

        <div className="text-sm text-gray-600 mb-2">
          <span className="font-semibold">Location:</span>{' '}
          {location.district}, {location.region}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <span className="font-semibold">Farmer:</span>{' '}
          {farmer.businessProfile?.businessName || `${farmer.firstName} ${farmer.lastName}`}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-semibold">Available:</span>{' '}
            {quantity.value} {quantity.unit}
          </div>
          
          <Link
            to={`/products/${_id}`}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-300"
          >
            View Details
          </Link>
        </div>

        {isFarmer && farmer._id === product.farmer._id && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between gap-2">
              <Link
                to={`/products/${_id}/edit`}
                className="flex-1 px-4 py-2 bg-blue-500 text-white text-center rounded hover:bg-blue-600 transition-colors duration-300"
              >
                Edit
              </Link>
              <button
                onClick={() => {/* Handle delete */}}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 