import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaStar, FaRegStar, FaStarHalfAlt, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data.data.product);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching product');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.quantity.value) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    try {
      await axios.post('/api/orders', {
        items: [{
          product: product._id,
          quantity: {
            value: quantity,
            unit: product.quantity.unit
          }
        }]
      });
      navigate('/cart');
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding to cart');
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 text-lg">{error}</div>
        <button
          onClick={fetchProduct}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <img
              src={product.images[selectedImage]?.url || '/images/placeholder.png'}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-green-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center mt-2">
              {renderStars(product.averageRating)}
              <span className="ml-2 text-gray-600">
                ({product.averageRating.toFixed(1)})
              </span>
            </div>
          </div>

          <div className="text-3xl font-bold text-green-600">
            GH₵ {product.price.value.toFixed(2)} / {product.price.unit.replace('per_', '')}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Availability</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-2 ${
                  product.availability.status === 'available' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.availability.status}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Quantity:</span>
                <span className="ml-2">
                  {product.quantity.value} {product.quantity.unit}
                </span>
              </div>
            </div>
          </div>

          {product.availability.status === 'available' && (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity ({product.quantity.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={product.quantity.value}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Product Details</h3>
            <div className="space-y-2">
              <p className="text-gray-700">{product.description}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2">{product.category}</span>
                </div>
                <div>
                  <span className="text-gray-600">Quality Grade:</span>
                  <span className="ml-2">{product.quality.grade}</span>
                </div>
                <div>
                  <span className="text-gray-600">Harvest Date:</span>
                  <span className="ml-2">
                    {new Date(product.harvest.date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Season:</span>
                  <span className="ml-2">{product.harvest.season}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Farmer Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-600">Name:</span>
                <span className="ml-2">
                  {product.farmer.businessProfile?.businessName || 
                   `${product.farmer.firstName} ${product.farmer.lastName}`}
                </span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-gray-500" />
                <span className="ml-2">
                  {product.location.community}, {product.location.district}, {product.location.region}
                </span>
              </div>
              {user && (
                <>
                  <div className="flex items-center">
                    <FaPhone className="text-gray-500" />
                    <span className="ml-2">{product.farmer.phoneNumber}</span>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-500" />
                    <span className="ml-2">{product.farmer.email}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {product.metadata.isOrganic || product.metadata.isFairTrade && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-2">Certifications</h3>
              <div className="space-y-2">
                {product.metadata.isOrganic && (
                  <div className="flex items-center">
                    <span className="text-green-600">✓</span>
                    <span className="ml-2">Organic Certified</span>
                  </div>
                )}
                {product.metadata.isFairTrade && (
                  <div className="flex items-center">
                    <span className="text-green-600">✓</span>
                    <span className="ml-2">Fair Trade Certified</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 