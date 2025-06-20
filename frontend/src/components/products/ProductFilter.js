import React, { useState } from 'react';
import { FaFilter } from 'react-icons/fa';

const ProductFilter = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
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
  ];

  const regions = [
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
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value
    });
  };

  const handleReset = () => {
    onFilterChange({
      category: '',
      region: '',
      district: '',
      minPrice: '',
      maxPrice: '',
      availability: ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4 md:hidden">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaFilter />
        </button>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            name="category"
            value={filters.category}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <select
            name="region"
            value={filters.region}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* District Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            District
          </label>
          <input
            type="text"
            name="district"
            value={filters.district}
            onChange={handleInputChange}
            placeholder="Enter district name"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Price Range Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range (GH₵)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleInputChange}
              placeholder="Min"
              className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleInputChange}
              placeholder="Max"
              className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Availability Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability
          </label>
          <select
            name="availability"
            value={filters.availability}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="limited">Limited Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-300"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilter; 