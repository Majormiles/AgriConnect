import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ChevronDownIcon, ChevronRightIcon, StarIcon, HeartIcon, CheckIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const ShopPage = () => {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [hotDeals, setHotDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [currentBanner, setCurrentBanner] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    region: '',
    district: '',
    minPrice: '',
    maxPrice: '',
    availability: ''
  });

  const banners = [
    {
      image: '/images/shoproducts/banner/Bannar1.png',
      title: 'AgriConnect Hub',
      subtitle: 'Fresh from farm to your table',
      description: 'One shopping point',
      buttonText: 'Start Shopping',
      bgColor: 'bg-green-600'
    },
    {
      image: '/images/shoproducts/banner/Bannar2.png',
      title: 'Fresh Vegetables',
      subtitle: 'Organic & Fresh',
      description: 'Direct from farmers',
      buttonText: 'Shop Now',
      bgColor: 'bg-orange-600'
    },
    {
      image: '/images/shoproducts/banner/Bannar3.png',
      title: 'Premium Quality',
      subtitle: 'Best Prices Guaranteed',
      description: 'Quality you can trust',
      buttonText: 'Explore',
      bgColor: 'bg-blue-600'
    }
  ];

  const categories = [
    { 
      name: 'Fresh Fruit', 
      value: 'Fruits', 
      image: '/categories/fruits.png',
      subcategories: ['Citrus', 'Tropical', 'Berries', 'Stone Fruits']
    },
    { 
      name: 'Fresh Vegetables', 
      value: 'Vegetables', 
      image: '/categories/Vegetable.png',
      subcategories: ['Leafy Greens', 'Root Vegetables', 'Peppers', 'Onions']
    },
    { 
      name: 'Meat & Fish', 
      value: 'Livestock', 
      image: '/categories/meat.png',
      subcategories: ['Beef', 'Chicken', 'Fish', 'Pork']
    },
    { 
      name: 'Snacks', 
      value: 'Snacks', 
      image: '/categories/snacks.png',
      subcategories: ['Nuts', 'Chips', 'Crackers', 'Dried Fruits']
    },
    { 
      name: 'Beverages', 
      value: 'Beverages', 
      image: '/categories/drinks.png',
      subcategories: ['Juices', 'Water', 'Soft Drinks', 'Tea & Coffee']
    },
    { 
      name: 'Cereals & Grains', 
      value: 'Cereals', 
      image: '/images/shoproducts/corn.png',
      subcategories: ['Rice', 'Wheat', 'Maize', 'Millet']
    },
    { 
      name: 'Tubers', 
      value: 'Tubers', 
      image: '/images/shoproducts/baking.png',
      subcategories: ['Yam', 'Potato', 'Cassava', 'Sweet Potato']
    },
    { 
      name: 'Legumes', 
      value: 'Legumes', 
      image: '/images/shoproducts/cooking.png',
      subcategories: ['Beans', 'Peas', 'Lentils', 'Groundnuts']
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams(filters);
      const response = await axios.get(`http://localhost:5001/api/products?${queryParams}`);
      const allProducts = response.data.data?.products || response.data || [];

      setProducts(allProducts);

      // Featured products (highest rated)
      const featured = allProducts
        .filter(product => product.averageRating >= 4.0)
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 10);
      setFeaturedProducts(featured);

      // Hot deals (products with discounts or on sale)
      const deals = allProducts
        .filter(product => product.discount > 0 || product.onSale)
        .slice(0, 10);
      setHotDeals(deals);

    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryValue) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryValue]: !prev[categoryValue]
    }));
  };

  const handleCategoryClick = (categoryValue) => {
    setFilters(prev => ({
      ...prev,
      category: categoryValue
    }));
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleSubcategoryClick = (subcategory) => {
    setFilters(prev => ({
      ...prev,
      category: subcategory
    }));
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const ProductCard = ({ product, showBadge = false, badgeText = '' }) => {
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(product, quantity);
      setQuantity(1);
    };

    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4 relative group w-full">
        {showBadge && badgeText && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
            {badgeText}
          </span>
        )}
        
        <div className="relative">
          <button className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-sm hover:bg-gray-50">
            <HeartIcon className="w-4 h-4 text-gray-400" />
          </button>
          
          <Link to={`/products/${product._id}`}>
            <img
              src={product.images?.[0]?.url || '/images/placeholder.png'}
              alt={product.name}
              className="w-full h-32 sm:h-36 md:h-40 object-contain mb-3 sm:mb-4 cursor-pointer"
            />
          </Link>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-3 h-3 ${i < Math.round(product.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-xs text-gray-500">({(product.averageRating || 0).toFixed(1)})</span>
          </div>

          <Link to={`/products/${product._id}`}>
            <h3 className="font-medium text-gray-800 hover:text-green-600 transition-colors cursor-pointer line-clamp-2 text-sm sm:text-base">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {product.discount > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  GH₵ {(product.price?.value * (1 + product.discount / 100)).toFixed(2)}
                </span>
              )}
              <span className="font-bold text-green-600 text-sm sm:text-base">
                GH₵ {product.price?.value?.toFixed(2) || '0.00'}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              /{product.price?.unit?.replace('per_', '') || 'unit'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center border rounded-md">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setQuantity(Math.max(1, quantity - 1));
                }}
                className="p-1 hover:bg-gray-100 text-gray-600 text-sm"
              >
                −
              </button>
              <span className="px-2 py-1 text-sm">{quantity}</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setQuantity(quantity + 1);
                }}
                className="p-1 hover:bg-gray-100 text-gray-600 text-sm"
              >
                +
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded-md hover:bg-green-700 text-xs sm:text-sm flex items-center space-x-1"
            >
              <span>Add</span>
              <CheckIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CategorySidebar = ({ isOpen, onClose }) => (
    <div className={`${isOpen ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'} lg:w-64 lg:flex-shrink-0`}>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar content */}
      <div className={`${isOpen ? 'fixed left-0 top-0 h-full w-80 max-w-xs z-50' : ''} lg:static lg:h-auto lg:w-full bg-white rounded-lg shadow-sm p-4 lg:sticky lg:top-4 overflow-y-auto`}>
        {/* Mobile header */}
        <div className="flex justify-between items-center mb-4 lg:hidden">
          <h3 className="font-semibold text-gray-800">Categories</h3>
          <button onClick={onClose} className="p-2">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <h3 className="font-semibold text-gray-800 mb-4 hidden lg:block">Popular Categories</h3>
        
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.value}>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleCategoryClick(category.value)}
                  className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 flex-1 ${
                    filters.category === category.value ? 'bg-green-50 text-green-600' : 'text-gray-700'
                  }`}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
                <button
                  onClick={() => toggleCategory(category.value)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {expandedCategories[category.value] ? (
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              {expandedCategories[category.value] && (
                <div className="ml-8 mt-2 space-y-1">
                  {category.subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => handleSubcategoryClick(sub)}
                      className="block text-sm text-gray-600 hover:text-green-600 py-1"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Special Offers Card */}
        <div className="mt-6 bg-green-600 text-white rounded-lg p-4 text-center">
          <h4 className="font-semibold mb-2">Special Offer</h4>
          <p className="text-sm mb-3">Save up to 30% on fresh vegetables</p>
          <button className="bg-white text-green-600 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100">
            Shop Now
          </button>
        </div>
      </div>
    </div>
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
        <div className="text-center p-4">
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
      {/* Hero Banner - Increased height and image sizes */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[28rem] bg-gradient-to-r from-green-600 to-green-500 overflow-hidden">
        <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`min-w-full h-full flex items-center justify-center ${
                index === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 w-full">
                <div className="flex items-center justify-between gap-6 lg:gap-12">
                  <div className="text-white flex-1 max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 leading-tight">
                      {banner.title}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg mb-1 opacity-90">{banner.subtitle}</p>
                    <p className="text-xs sm:text-sm mb-4 sm:mb-6 opacity-80">{banner.description}</p>
                    <button className="bg-white text-green-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base">
                      {banner.buttonText}
                    </button>
                  </div>
                  <div className="hidden sm:flex flex-shrink-0 justify-center items-center">
                    <img 
                      src={banner.image} 
                      alt={banner.title}
                      className="h-56 sm:h-64 md:h-80 lg:h-96 xl:h-[28rem] w-auto object-contain max-w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Banner indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                index === currentBanner ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features Strip */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-center">
            <div className="flex items-center justify-center space-x-2 py-2">
              <img src="/icons/delivery-truck 1.png" alt="Free Shipping" className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm text-gray-600">Free Shipping</span>
            </div>
            <div className="flex items-center justify-center space-x-2 py-2">
              <img src="/icons/headphones 1.png" alt="Customer Support" className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm text-gray-600">Customer Support 24/7</span>
            </div>
            <div className="flex items-center justify-center space-x-2 py-2">
              <img src="/icons/package.png" alt="Secure Payment" className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm text-gray-600">100% Secure Payment</span>
            </div>
            <div className="flex items-center justify-center space-x-2 py-2">
              <img src="/icons/shopping-bag.png" alt="Money Back Guarantee" className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm text-gray-600">Money Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Mobile category toggle button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm"
          >
            <Bars3Icon className="w-5 h-5" />
            <span>Categories</span>
          </button>
        </div>

        <div className="flex gap-4 lg:gap-6">
          {/* Sidebar Categories */}
          <CategorySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Popular Products */}
            <section className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Popular Products</h2>
                <Link to="/products" className="text-green-600 hover:text-green-700 font-medium text-sm sm:text-base">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                {products.slice(0, 10).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>

            {/* Hot Deals */}
            {hotDeals.length > 0 && (
              <section className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Hot Deals</h2>
                  <span className="text-green-600 font-medium text-sm sm:text-base">View All →</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                  {hotDeals.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      showBadge={true}
                      badgeText={product.discount > 0 ? `${product.discount}% OFF` : 'SALE'}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
              <section className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Featured Products</h2>
                  <span className="text-green-600 font-medium text-sm sm:text-base">View All →</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;