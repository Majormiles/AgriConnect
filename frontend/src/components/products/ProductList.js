import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import ProductFilter from './ProductFilter';
import ProductSort from './ProductSort';
import Pagination from '../common/Pagination';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

const ProductList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    region: '',
    district: '',
    minPrice: '',
    maxPrice: '',
    availability: ''
  });
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters, sort]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construct query parameters
      const queryParams = new URLSearchParams({
        page: currentPage,
        sort,
        ...filters
      });

      const response = await axios.get(`/api/products?${queryParams}`);
      setProducts(response.data.data.products);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setCurrentPage(1); // Reset to first page when filters change
    setFilters(newFilters);
  };

  const handleSortChange = (newSort) => {
    setCurrentPage(1); // Reset to first page when sort changes
    setSort(newSort);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top when page changes
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
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        {user?.role === 'farmer' && (
          <Link
            to="/products/new"
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <FaPlus className="mr-2" />
            Add Product
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters - Left Sidebar */}
        <div className="md:col-span-1">
          <ProductFilter filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Products Grid */}
        <div className="md:col-span-3">
          {/* Sort and Results Count */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600">
              {products.length} products found
            </span>
            <ProductSort sort={sort} onSortChange={handleSortChange} />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">No products found matching your criteria.</p>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isFarmer={user?.role === 'farmer' && user?._id === product.farmer._id}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList; 