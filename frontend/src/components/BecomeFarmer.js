import React from 'react';
import { Link } from 'react-router-dom';

const BecomeFarmer = () => {
  return (
    <section className="bg-green-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Sell Your Farm Products on AgriConnect
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join our growing community of farmers and reach customers directly. 
            Get better prices for your produce and grow your farming business.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-green-600 text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-2">Easy Setup</h3>
              <p className="text-gray-600">
                Create your farmer profile in minutes and start listing your products
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-green-600 text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Better Prices</h3>
              <p className="text-gray-600">
                Set your own prices and sell directly to consumers
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-green-600 text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Simple Management</h3>
              <p className="text-gray-600">
                Manage orders, track inventory, and communicate with buyers easily
              </p>
            </div>
          </div>
          
          <Link 
            to="/register-farmer"
            className="inline-block bg-green-600 text-white text-lg font-medium px-8 py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            Start Selling Today
          </Link>
          
          <div className="mt-8 text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-green-600 hover:text-green-700">Log in here</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BecomeFarmer; 