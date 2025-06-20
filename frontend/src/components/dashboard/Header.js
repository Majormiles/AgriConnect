import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Back to Home Link */}
          <Link 
            to="/"
            className="ml-4 flex items-center text-gray-700 hover:text-green-600 transition-colors duration-150"
          >
            <svg 
              className="h-5 w-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>

        {/* User info and navigation */}
        <div className="flex items-center space-x-4">
          {/* Weather Widget - For farmers */}
          {user?.role === 'farmer' && (
            <div className="hidden sm:flex items-center px-4 py-2 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Weather</p>
                <p className="text-xs text-blue-700">Sunny, 28°C</p>
              </div>
            </div>
          )}

          {/* User Profile */}
          <div className="flex items-center">
            <span className="hidden sm:inline text-gray-700 text-sm font-medium mr-2">
              Welcome, {user?.firstName}
            </span>
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 