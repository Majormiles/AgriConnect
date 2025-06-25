import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, HeartIcon, UserIcon, MagnifyingGlassIcon, PhoneIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { getTotalQuantity, toggleCart } = useCart();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white shadow-sm relative z-50">
      {/* Top bar */}
      <div className="bg-gray-100 text-sm py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span className="text-gray-600 text-xs sm:text-sm">Somewhere in Ghana</span>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span>Eng</span>
            <span>INFO</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold"></span>
              </div>
              <span className="text-xl font-bold text-gray-800">AgriConnect</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={toggleMobileMenu} 
            className="md:hidden flex items-center text-gray-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Navigation for desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary font-medium">Home</Link>
            <Link to="/shop" className="text-gray-700 hover:text-primary font-medium">Shop</Link>

            <Link to="#" className="text-gray-700 hover:text-primary font-medium">About Us</Link>
            <Link 
              to="/register-farmer" 
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Become a Farmer
            </Link>
          </nav>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <PhoneIcon className="w-4 h-4" />
              <span>0241594698</span>
            </div>
            <MagnifyingGlassIcon className="w-6 h-6 text-gray-600 cursor-pointer" />
            <HeartIcon className="w-6 h-6 text-gray-600 cursor-pointer" />
            <div className="relative">
              <ShoppingCartIcon 
                className="w-6 h-6 text-gray-600 cursor-pointer" 
                onClick={toggleCart}
              />
              {getTotalQuantity() > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalQuantity()}
                </span>
              )}
            </div>
            
            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              {isAuthenticated ? (
                <div 
                  className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-secondary transition-colors"
                  onClick={toggleUserDropdown}
                >
                  {currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}
                </div>
              ) : (
                <UserIcon 
                  className="w-6 h-6 text-gray-600 cursor-pointer hover:text-primary transition-colors" 
                  onClick={toggleUserDropdown}
                />
              )}
              
              {/* Dropdown menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {isAuthenticated ? (
                    <>
                      <Link 
                        to="/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="#" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Login
                      </Link>
                      <Link 
                        to="/register" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Sign Up
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <Link 
                        to="/register-farmer" 
                        className="block px-4 py-2 text-sm text-green-600 hover:bg-gray-100 transition-colors font-medium"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Become a Farmer
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile icons */}
          <div className="flex items-center space-x-3 md:hidden">
            <div className="relative">
              <ShoppingCartIcon 
                className="w-6 h-6 text-gray-600 cursor-pointer" 
                onClick={toggleCart}
              />
              {getTotalQuantity() > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalQuantity()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div 
          ref={sidebarRef}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
        >
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-800">Menu</span>
                <button 
                  onClick={toggleMobileMenu}
                  className="text-gray-600 focus:outline-none"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <nav className="px-4 py-6">
              <Link 
                to="/" 
                className="block py-2 text-gray-700 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/shop" 
                className="block py-2 text-gray-700 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              {/* <Link 
                to="/market" 
                className="block py-2 text-gray-700 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Market Prices
              </Link> */}
              <Link 
                to="#" 
                className="block py-2 text-gray-700 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                to="/register-farmer" 
                className="block py-2 text-green-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Become a Farmer
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;