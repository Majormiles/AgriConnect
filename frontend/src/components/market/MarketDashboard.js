import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw, BarChart3, LineChart, MapPin } from 'lucide-react';

const MarketDashboard = () => {
  const [marketData, setMarketData] = useState({
    categoryPrices: [],
    trendingProducts: [],
    regionalComparison: [],
    loading: true
  });
  const [selectedRegion, setSelectedRegion] = useState('');
  const [priceAlerts, setPriceAlerts] = useState([]);
  
  const API_URL = 'http://localhost:5001/api';

  const regions = [
    'Greater Accra', 'Ashanti', 'Central', 'Eastern', 'Northern', 
    'Western', 'Volta', 'Brong-Ahafo', 'Upper East', 'Upper West'
  ];

  useEffect(() => {
    fetchMarketOverview();
    fetchUserAlerts();
  }, [selectedRegion]);

  const fetchMarketOverview = async () => {
    try {
      setMarketData(prev => ({ ...prev, loading: true }));
      
      const params = new URLSearchParams();
      if (selectedRegion) params.append('region', selectedRegion);
      
      const response = await fetch(`${API_URL}/market/overview?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMarketData({
          ...data.data,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching market overview:', error);
      setMarketData(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchUserAlerts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/market/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPriceAlerts(data.data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatTrend = (change) => {
    if (!change) return null;
    const isPositive = change > 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span className="ml-1">{Math.abs(change).toFixed(1)}%</span>
      </span>
    );
  };

  if (marketData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Market Intelligence
              </h1>
              <p className="text-lg sm:text-xl opacity-90 mb-6">
                Real-time agricultural market data for {selectedRegion || 'All Regions'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-300 min-w-48"
                >
                  <option value="">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                
                <button
                  onClick={fetchMarketOverview}
                  className="flex items-center justify-center px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  <RefreshCw size={20} className="mr-2" />
                  Refresh Data
                </button>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center justify-center">
              <div className="bg-white/10 rounded-full p-8">
                <BarChart3 size={80} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center space-x-3 py-2">
              <LineChart className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Real-time Pricing</span>
            </div>
            <div className="flex items-center justify-center space-x-3 py-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Regional Analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-3 py-2">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <span className="text-sm font-medium text-gray-700">Price Alerts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Price Alerts */}
        {priceAlerts.length > 0 && (
          <section className="mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <AlertCircle className="text-amber-600 mr-3" size={24} />
                <h3 className="text-xl font-bold text-amber-800">Active Price Alerts</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {priceAlerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-amber-200">
                    <div className="text-sm font-medium text-amber-900 mb-1">
                      {alert.product.name}
                    </div>
                    <div className="text-xs text-amber-700">
                      Price changed by {alert.threshold.value}% in {alert.location?.region || 'your area'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Market Statistics Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Total Categories</h4>
                  <p className="text-3xl font-bold text-green-600">
                    {marketData.categoryPrices.length}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Active Products</h4>
                  <p className="text-3xl font-bold text-blue-600">
                    {marketData.trendingProducts.length}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <LineChart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Regions Covered</h4>
                  <p className="text-3xl font-bold text-purple-600">
                    {marketData.regionalComparison.length}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Prices */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Average Prices by Category</h2>
            <span className="text-sm text-gray-500">Updated recently</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {marketData.categoryPrices.map((category, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{category._id}</h4>
                      <p className="text-sm text-gray-600">
                        {category.products?.length || 0} products available
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 mb-1">
                        {formatPrice(category.avgPrice)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Supply: {category.totalSupply?.toLocaleString() || 0} units
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Products */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Trending Products</h2>
            <span className="text-sm text-gray-500">Price movements today</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {marketData.trendingProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{product._id}</h4>
                      <p className="text-sm text-gray-600">
                        Current: {formatPrice(product.currentPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="mb-2">
                        {formatTrend(product.priceChange)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Supply: {product.supply?.toLocaleString() || 0} units
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Regional Comparison */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Regional Comparison</h2>
            <span className="text-sm text-gray-500">Compare prices across regions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketData.regionalComparison.map((region, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{region.region}</h4>
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-green-600 mb-4">
                  {formatPrice(region.avgPrice)}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product Variety:</span>
                    <span className="font-medium text-gray-900">{region.productVariety}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Supply:</span>
                    <span className="font-medium text-gray-900">{region.totalSupply?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MarketDashboard; 