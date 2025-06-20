import React from 'react';
import { FaSort } from 'react-icons/fa';

const ProductSort = ({ sort, onSortChange }) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <FaSort className="text-gray-500" />
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductSort; 