import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaUpload, FaTrash } from 'react-icons/fa';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    quantity: {
      value: '',
      unit: 'kg'
    },
    price: {
      value: '',
      unit: 'per_kg'
    },
    location: {
      region: user?.farm?.location?.region || '',
      district: user?.farm?.location?.district || '',
      community: ''
    },
    quality: {
      grade: 'A',
      description: ''
    },
    availability: {
      from: '',
      to: '',
      status: 'available'
    },
    harvest: {
      date: '',
      season: 'major'
    },
    storage: {
      type: 'On Farm',
      conditions: ''
    },
    minimumOrder: {
      value: '',
      unit: 'kg'
    },
    metadata: {
      isOrganic: false,
      isFairTrade: false,
      isLocallySourced: true
    }
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      const product = response.data.data.product;
      setFormData(product);
      setPreviewImages(product.images);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);

    // Create preview URLs
    const newPreviewImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      caption: ''
    }));
    setPreviewImages((prev) => [...prev, ...newPreviewImages]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Create FormData for file upload
      const formDataToSend = new FormData();
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      // Append other form data
      Object.keys(formData).forEach((key) => {
        if (typeof formData[key] === 'object') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (id) {
        await axios.patch(`/api/products/${id}`, formDataToSend);
      } else {
        await axios.post('/api/products', formDataToSend);
      }

      navigate('/dashboard/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">
        {id ? 'Edit Product' : 'Add New Product'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="Cereals">Cereals</option>
                <option value="Tubers">Tubers</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Legumes">Legumes</option>
                <option value="Cash Crops">Cash Crops</option>
                <option value="Livestock">Livestock</option>
                <option value="Poultry">Poultry</option>
                <option value="Fish">Fish</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Pricing and Quantity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Pricing and Quantity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="price.value"
                  value={formData.price.value}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <select
                  name="price.unit"
                  value={formData.price.unit}
                  onChange={handleInputChange}
                  required
                  className="w-1/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="per_kg">per kg</option>
                  <option value="per_ton">per ton</option>
                  <option value="per_bag">per bag</option>
                  <option value="per_piece">per piece</option>
                  <option value="per_crate">per crate</option>
                  <option value="per_box">per box</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Available
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="quantity.value"
                  value={formData.quantity.value}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <select
                  name="quantity.unit"
                  value={formData.quantity.unit}
                  onChange={handleInputChange}
                  required
                  className="w-1/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="kg">kg</option>
                  <option value="tons">tons</option>
                  <option value="bags">bags</option>
                  <option value="pieces">pieces</option>
                  <option value="crates">crates</option>
                  <option value="boxes">boxes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                name="location.region"
                value={formData.location.region}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Region</option>
                <option value="Greater Accra">Greater Accra</option>
                <option value="Ashanti">Ashanti</option>
                <option value="Central">Central</option>
                <option value="Eastern">Eastern</option>
                <option value="Northern">Northern</option>
                <option value="Western">Western</option>
                <option value="Volta">Volta</option>
                <option value="Brong-Ahafo">Brong-Ahafo</option>
                <option value="Upper East">Upper East</option>
                <option value="Upper West">Upper West</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <input
                type="text"
                name="location.district"
                value={formData.location.district}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community
              </label>
              <input
                type="text"
                name="location.community"
                value={formData.location.community}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Product Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
            {previewImages.length < 4 && (
              <label className="border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center h-32 cursor-pointer hover:border-green-500">
                <FaUpload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                />
              </label>
            )}
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Grade
              </label>
              <select
                name="quality.grade"
                value={formData.quality.grade}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Type
              </label>
              <select
                name="storage.type"
                value={formData.storage.type}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Warehouse">Warehouse</option>
                <option value="Cold Storage">Cold Storage</option>
                <option value="On Farm">On Farm</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harvest Date
              </label>
              <input
                type="date"
                name="harvest.date"
                value={formData.harvest.date}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season
              </label>
              <select
                name="harvest.season"
                value={formData.harvest.season}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="major">Major Season</option>
                <option value="minor">Minor Season</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Certifications
            </h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="metadata.isOrganic"
                  checked={formData.metadata.isOrganic}
                  onChange={handleInputChange}
                  className="rounded text-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Organic Certified</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="metadata.isFairTrade"
                  checked={formData.metadata.isFairTrade}
                  onChange={handleInputChange}
                  className="rounded text-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Fair Trade Certified</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : id ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 