import React from 'react';

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🌱</span>
              </div>
              <span className="text-xl font-bold">AgriConnect </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Agriculture Products Rural<br />
              E-Marketplace Management System<br />
              Agriculture Hub
            </p>
          </div>

          {/* My Account */}
          <div>
            <h3 className="font-semibold mb-4">My Account</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">My Account</a></li>
              <li><a href="#" className="hover:text-white">Order History</a></li>
              <li><a href="#" className="hover:text-white">Shopping Cart</a></li>
              <li><a href="#" className="hover:text-white">Wishlist</a></li>
            </ul>
          </div>

          {/* Helps */}
          <div>
            <h3 className="font-semibold mb-4">Helps</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Faqs</a></li>
              <li><a href="#" className="hover:text-white">Terms & Condition</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Fruit & Vegetables</a></li>
              <li><a href="#" className="hover:text-white">Meat & Fish</a></li>
              <li><a href="#" className="hover:text-white">Bread & Bakery</a></li>
              <li><a href="#" className="hover:text-white">Beauty & Health</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Major Myles. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 