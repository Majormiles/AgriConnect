import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Create the context
const DashboardContext = createContext(null);

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Get auth token
const getAuthToken = () => localStorage.getItem('accessToken');

// Initial state
const initialState = {
  profile: null,
  preferences: {
    theme: 'light',
    notifications: {
      email: true,
      sms: false,
      orderUpdates: true,
      marketPrices: true,
      weatherAlerts: true
    }
  },
  notifications: [],
  recentActivity: [],
  farm: {
    details: {
      farmName: '',
      location: {
        region: '',
        district: ''
      },
      size: {
        value: 0,
        unit: 'acres'
      },
      crops: []
    }
  },
  loading: false,
  error: null
};

// Reducer function
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_DASHBOARD_DATA':
      return { 
        ...state, 
        ...action.payload,
        loading: false,
        error: null 
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: { ...state.profile, ...action.payload },
        loading: false,
        error: null
      };
    case 'SYNC_WITH_AUTH':
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
          lastLogin: action.payload.lastLogin || state.profile?.lastLogin,
          createdAt: action.payload.createdAt || state.profile?.createdAt,
          status: action.payload.status || state.profile?.status
        }
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
        loading: false,
        error: null
      };
    case 'UPDATE_FARM':
      return {
        ...state,
        farm: { ...state.farm, ...action.payload },
        loading: false,
        error: null
      };
    case 'ADD_CROP':
      return {
        ...state,
        farm: {
          ...state.farm,
          details: {
            ...state.farm.details,
            crops: [...(state.farm.details.crops || []), action.payload]
          }
        },
        loading: false,
        error: null
      };
    case 'UPDATE_CROP':
      return {
        ...state,
        farm: {
          ...state.farm,
          details: {
            ...state.farm.details,
            crops: state.farm.details.crops.map(crop =>
              crop._id === action.payload._id ? action.payload : crop
            )
          }
        },
        loading: false,
        error: null
      };
    case 'DELETE_CROP':
      return {
        ...state,
        farm: {
          ...state.farm,
          details: {
            ...state.farm.details,
            crops: state.farm.details.crops.filter(crop => 
              crop._id !== action.payload
            )
          }
        },
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

// Provider component
export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { currentUser } = useAuth();

  // Sync with AuthContext
  useEffect(() => {
    if (currentUser) {
      dispatch({ type: 'SYNC_WITH_AUTH', payload: currentUser });
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
      
      dispatch({ type: 'SET_DASHBOARD_DATA', payload: data.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      dispatch({ type: 'UPDATE_PROFILE', payload: data.data.user });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error; // Re-throw to handle in the component
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/preferences`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update preferences');
      }
      
      dispatch({ type: 'UPDATE_PREFERENCES', payload: data.data.preferences });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateFarmProfile = async (farmData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/farm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(farmData)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update farm profile');
      }
      
      dispatch({ type: 'UPDATE_FARM', payload: data.data.farm });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const addCrop = async (cropData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/farm/crops`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cropData)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add crop');
      }
      
      dispatch({ type: 'ADD_CROP', payload: data.data.crop });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateCrop = async (cropId, cropData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/farm/crops/${cropId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cropData)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update crop');
      }
      
      dispatch({ type: 'UPDATE_CROP', payload: data.data.crop });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteCrop = async (cropId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/farm/crops/${cropId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete crop');
      }
      
      dispatch({ type: 'DELETE_CROP', payload: cropId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchDashboardData();
    }
  }, []);

  const value = {
    ...state,
    fetchDashboardData,
    updateProfile,
    updatePreferences,
    updateFarmProfile,
    addCrop,
    updateCrop,
    deleteCrop
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook to use the dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}; 