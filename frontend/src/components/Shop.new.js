import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ShopPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    region: '',
    district: '',
    minPrice: '',
    maxPrice: '',
    availability: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construct query parameters
      const queryParams = new URLSearchParams(filters);

      // Fetch all products
      const response = await axios.get(`/api/products?${queryParams}`);
      const allProducts = response.data.data.products;

      // Set regular products
      setProducts(allProducts);

      // Set featured products (products with highest ratings)
      const featured = allProducts
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5);
      setFeaturedProducts(featured);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Fresh Fruit', value: 'Fruits', image: '/images/shoproducts/fruit.png' },
    { name: 'Fresh Vegetables', value: 'Vegetables', image: '/images/shoproducts/freshvegitables.png' },
    { name: 'Meat & Fish', value: 'Livestock', image: '/images/shoproducts/meat.png' },
    { name: 'Cereals', value: 'Cereals', image: '/images/shoproducts/corn.png' },
    { name: 'Tubers', value: 'Tubers', image: '/images/shoproducts/baking.png' },
    { name: 'Legumes', value: 'Legumes', image: '/images/shoproducts/cooking.png' },
    { name: 'Cash Crops', value: 'Cash Crops', image: '/images/shoproducts/oil.png' },
    { name: 'Poultry', value: 'Poultry', image: '/images/shoproducts/meat.png' }
  ];

  const handleCategoryClick = (categoryValue) => {
    setFilters(prev => ({
      ...prev,
      category: categoryValue
    }));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`inline-block w-3 h-3 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  const ProductCard = ({ product, showQuantity = false }) => (
    <Link to={`/products/${product._id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
        <div className="relative">
          {product.availability.status !== 'available' && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
              {product.availability.status}
            </span>
          )}
          <button className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded">
            <span className="text-gray-400 text-lg">♡</span>
          </button>
          <img
            src={product.images[0]?.url || '/images/placeholder.png'}
            alt={product.name}
            className="w-full h-32 object-contain mb-4"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-1">
            {renderStars(product.averageRating)}
            <span className="text-sm text-gray-500">({product.averageRating.toFixed(1)})</span>
          </div>
          <h3 className="font-medium text-gray-800">{product.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg">GH₵ {product.price.value.toFixed(2)}</span>
            </div>
            <span className="text-gray-500 text-sm">/{product.price.unit.replace('per_', '')}</span>
          </div>
          <div className="text-sm text-gray-500">
            {product.location.district}, {product.location.region}
          </div>
          {showQuantity ? (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center border rounded">
                <button className="p-1 hover:bg-gray-100">
                  <span className="text-gray-600">−</span>
                </button>
                <span className="px-3 py-1">1</span>
                <button className="p-1 hover:bg-gray-100">
                  <span className="text-gray-600">+</span>
                </button>
              </div>
              <button className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
                <span className="text-sm">🛒</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={(e) => {
                e.preventDefault();
                // Handle add to cart
              }}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button
            onClick={fetchProducts}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Categories */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              <div className="space-y-4">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleCategoryClick(category.value)}
                    className={`flex items-center space-x-3 w-full p-2 rounded hover:bg-gray-50 ${
                      filters.category === category.value ? 'bg-gray-50' : ''
                    }`}
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-gray-700">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="col-span-2">
            {/* Featured Products */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Featured Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>

            {/* All Products */}
            <div>
              <h2 className="text-xl font-semibold mb-4">All Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} showQuantity />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage; 