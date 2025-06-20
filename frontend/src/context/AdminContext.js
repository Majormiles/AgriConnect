import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

// Admin API base URL
const API_URL = 'http://localhost:5001/api/admin';

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if admin is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (token) {
        const response = await axios.get(`${API_URL}/profile`);
        setAdmin(response.data.data.admin);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout(); // Clear invalid token
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      });

      const { token: newToken, data } = response.data;
      
      localStorage.setItem('adminToken', newToken);
      setToken(newToken);
      setAdmin(data.admin);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true, admin: data.admin };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      setToken(null);
      setAdmin(null);
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.patch(`${API_URL}/profile`, profileData);
      setAdmin(response.data.data.admin);
      return { success: true, admin: response.data.data.admin };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return { success: false, message };
    }
  };

  // Dashboard stats
  const getDashboardStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  };

  // User management
  const getUsers = async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/users`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  };

  const getUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user details');
    }
  };

  const updateUserVerification = async (userId, status, notes) => {
    try {
      const response = await axios.patch(`${API_URL}/users/${userId}/verification`, {
        status,
        notes
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user verification');
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const response = await axios.patch(`${API_URL}/users/${userId}/status`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to toggle user status');
    }
  };

  // Product management
  const getProducts = async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/products`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  };

  const updateProductStatus = async (productId, status, notes) => {
    try {
      const response = await axios.patch(`${API_URL}/products/${productId}/status`, {
        status,
        notes
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update product status');
    }
  };

  // Order management
  const getOrders = async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/orders`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  };

  // Analytics
  const getAnalytics = async (timeframe = '30d') => {
    try {
      const response = await axios.get(`${API_URL}/analytics`, {
        params: { timeframe }
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  };

  // Permission check helper
  const hasPermission = (module, action) => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    
    const modulePermission = admin.permissions?.find(p => p.module === module);
    return modulePermission && modulePermission.actions.includes(action);
  };

  const value = {
    admin,
    loading,
    token,
    login,
    logout,
    updateProfile,
    checkAuth,
    hasPermission,
    // API methods
    getDashboardStats,
    getUsers,
    getUserDetails,
    updateUserVerification,
    toggleUserStatus,
    getProducts,
    updateProductStatus,
    getOrders,
    getAnalytics
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}; 