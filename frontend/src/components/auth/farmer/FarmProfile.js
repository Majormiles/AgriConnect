import React, { useState } from 'react';

// Ghana regions data
const GHANA_REGIONS = [
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

// Common crops in Ghana
const COMMON_CROPS = [
  'Cocoa',
  'Maize',
  'Rice',
  'Cassava',
  'Yam',
  'Plantain',
  'Tomatoes',
  'Peppers',
  'Groundnuts',
  'Beans',
  'Millet',
  'Sorghum',
  'Oil Palm',
  'Coconut',
  'Cashew'
];

const FarmProfile = ({ formData, onChange, errors }) => {
  const [selectedCrops, setSelectedCrops] = useState(formData.farm.primaryCrops || []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(2, {
      farm: {
        ...formData.farm,
        [name]: value
      }
    });
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    onChange(2, {
      farm: {
        ...formData.farm,
        location: {
          ...formData.farm.location,
          [name]: value
        }
      }
    });
  };

  const handleSizeChange = (e) => {
    const { name, value } = e.target;
    onChange(2, {
      farm: {
        ...formData.farm,
        size: {
          ...formData.farm.size,
          [name]: value
        }
      }
    });
  };

  const handleCropSelection = (crop) => {
    const updatedCrops = selectedCrops.includes(crop)
      ? selectedCrops.filter(c => c !== crop)
      : [...selectedCrops, crop];
    
    setSelectedCrops(updatedCrops);
    onChange(2, {
      farm: {
        ...formData.farm,
        primaryCrops: updatedCrops
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="farmName" className="block text-sm font-medium text-gray-700">
          Farm Name
        </label>
        <div className="mt-1">
          <input
            id="farmName"
            name="farmName"
            type="text"
            required
            value={formData.farm.farmName}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
              errors.farmName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.farmName && (
            <p className="mt-2 text-sm text-red-600">{errors.farmName}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700">
          Region
        </label>
        <div className="mt-1">
          <select
            id="region"
            name="region"
            required
            value={formData.farm.location.region}
            onChange={handleLocationChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
              errors.region ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select a region</option>
            {GHANA_REGIONS.map(region => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          {errors.region && (
            <p className="mt-2 text-sm text-red-600">{errors.region}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="district" className="block text-sm font-medium text-gray-700">
          District
        </label>
        <div className="mt-1">
          <input
            id="district"
            name="district"
            type="text"
            required
            value={formData.farm.location.district}
            onChange={handleLocationChange}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
              errors.district ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.district && (
            <p className="mt-2 text-sm text-red-600">{errors.district}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="community" className="block text-sm font-medium text-gray-700">
          Community/Village
        </label>
        <div className="mt-1">
          <input
            id="community"
            name="community"
            type="text"
            value={formData.farm.location.community}
            onChange={handleLocationChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700">
            Farm Size
          </label>
          <div className="mt-1">
            <input
              id="value"
              name="value"
              type="number"
              min="0"
              step="0.1"
              required
              value={formData.farm.size.value}
              onChange={handleSizeChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                errors.farmSize ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
            Unit
          </label>
          <div className="mt-1">
            <select
              id="unit"
              name="unit"
              value={formData.farm.size.unit}
              onChange={handleSizeChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="acres">Acres</option>
              <option value="hectares">Hectares</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Crops
        </label>
        <div className="grid grid-cols-2 gap-2">
          {COMMON_CROPS.map(crop => (
            <button
              key={crop}
              type="button"
              onClick={() => handleCropSelection(crop)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedCrops.includes(crop)
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
        {errors.primaryCrops && (
          <p className="mt-2 text-sm text-red-600">{errors.primaryCrops}</p>
        )}
      </div>

      <div>
        <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
          Years of Farming Experience
        </label>
        <div className="mt-1">
          <input
            id="yearsOfExperience"
            name="yearsOfExperience"
            type="number"
            min="0"
            required
            value={formData.farm.yearsOfExperience}
            onChange={handleChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="ownershipStatus" className="block text-sm font-medium text-gray-700">
          Farm Ownership Status
        </label>
        <div className="mt-1">
          <select
            id="ownershipStatus"
            name="ownershipStatus"
            required
            value={formData.farm.ownershipStatus}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option value="">Select ownership status</option>
            <option value="owned">Owned</option>
            <option value="leased">Leased</option>
            <option value="shared">Shared</option>
            <option value="community">Community Land</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FarmProfile; 