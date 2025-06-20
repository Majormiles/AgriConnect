import React, { useState } from 'react';

const SOIL_TYPES = [
  'Sandy',
  'Clay',
  'Loamy',
  'Silt',
  'Sandy Loam',
  'Clay Loam',
  'Black Cotton',
  'Red Soil',
  'Forest Soil'
];

const WATER_SOURCES = [
  'Rain-fed',
  'River/Stream',
  'Well',
  'Borehole',
  'Dam',
  'Irrigation System',
  'Natural Spring'
];

const IRRIGATION_METHODS = [
  'None',
  'Drip Irrigation',
  'Sprinkler System',
  'Flood Irrigation',
  'Manual Watering',
  'Center Pivot'
];

const FARMING_METHODS = [
  'Traditional',
  'Organic',
  'Conventional',
  'Mixed',
  'Conservation Agriculture',
  'Agroforestry'
];

const CERTIFICATIONS = [
  'Organic Certification',
  'Global GAP',
  'Fair Trade',
  'Rainforest Alliance',
  'UTZ Certified',
  'ISO 22000'
];

const SEASONAL_PATTERNS = [
  'Major Season (March-July)',
  'Minor Season (September-November)',
  'Year-round Production',
  'Seasonal Rotation'
];

const AgriculturalSpecs = ({ formData, onChange, errors }) => {
  const [selectedCertifications, setSelectedCertifications] = useState(
    formData.farmSpecs.certifications || []
  );
  const [selectedSeasons, setSelectedSeasons] = useState(
    formData.farmSpecs.seasonalPatterns || []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(3, {
      farmSpecs: {
        ...formData.farmSpecs,
        [name]: value
      }
    });
  };

  const handleCertificationToggle = (cert) => {
    const updatedCerts = selectedCertifications.includes(cert)
      ? selectedCertifications.filter(c => c !== cert)
      : [...selectedCertifications, cert];
    
    setSelectedCertifications(updatedCerts);
    onChange(3, {
      farmSpecs: {
        ...formData.farmSpecs,
        certifications: updatedCerts
      }
    });
  };

  const handleSeasonToggle = (season) => {
    const updatedSeasons = selectedSeasons.includes(season)
      ? selectedSeasons.filter(s => s !== season)
      : [...selectedSeasons, season];
    
    setSelectedSeasons(updatedSeasons);
    onChange(3, {
      farmSpecs: {
        ...formData.farmSpecs,
        seasonalPatterns: updatedSeasons
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="soilType" className="block text-sm font-medium text-gray-700">
          Soil Type
        </label>
        <div className="mt-1">
          <select
            id="soilType"
            name="soilType"
            required
            value={formData.farmSpecs.soilType}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
              errors.soilType ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select soil type</option>
            {SOIL_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.soilType && (
            <p className="mt-2 text-sm text-red-600">{errors.soilType}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="waterSource" className="block text-sm font-medium text-gray-700">
          Primary Water Source
        </label>
        <div className="mt-1">
          <select
            id="waterSource"
            name="waterSource"
            required
            value={formData.farmSpecs.waterSource}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
              errors.waterSource ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select water source</option>
            {WATER_SOURCES.map(source => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
          {errors.waterSource && (
            <p className="mt-2 text-sm text-red-600">{errors.waterSource}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="irrigationMethod" className="block text-sm font-medium text-gray-700">
          Irrigation Method
        </label>
        <div className="mt-1">
          <select
            id="irrigationMethod"
            name="irrigationMethod"
            value={formData.farmSpecs.irrigationMethod}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option value="">Select irrigation method</option>
            {IRRIGATION_METHODS.map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="farmingMethodology" className="block text-sm font-medium text-gray-700">
          Farming Methodology
        </label>
        <div className="mt-1">
          <select
            id="farmingMethodology"
            name="farmingMethodology"
            required
            value={formData.farmSpecs.farmingMethodology}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
              errors.farmingMethodology ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select farming method</option>
            {FARMING_METHODS.map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          {errors.farmingMethodology && (
            <p className="mt-2 text-sm text-red-600">{errors.farmingMethodology}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications (if any)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CERTIFICATIONS.map(cert => (
            <button
              key={cert}
              type="button"
              onClick={() => handleCertificationToggle(cert)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedCertifications.includes(cert)
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {cert}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="productionCapacity" className="block text-sm font-medium text-gray-700">
          Estimated Annual Production Capacity (in tons)
        </label>
        <div className="mt-1">
          <input
            id="productionCapacity"
            name="productionCapacity"
            type="number"
            min="0"
            step="0.1"
            value={formData.farmSpecs.productionCapacity}
            onChange={handleChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Enter estimated production in tons"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seasonal Farming Patterns
        </label>
        <div className="grid grid-cols-1 gap-2">
          {SEASONAL_PATTERNS.map(season => (
            <button
              key={season}
              type="button"
              onClick={() => handleSeasonToggle(season)}
              className={`px-4 py-2 rounded-md text-sm font-medium text-left ${
                selectedSeasons.includes(season)
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgriculturalSpecs; 