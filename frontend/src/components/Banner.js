import React from 'react';
import { Link } from 'react-router-dom';
// Banner Component
const Banner = () => {
  return (
    <section
      className="py-8 sm:py-12 md:py-16 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/images/banner.png')`,
        minHeight: '400px',
      }}
    >
      {/* Overlay for better text readability if needed */}
      <div className="absolute inset-0 bg-white bg-opacity-10"></div>

      <div className="container mx-auto px-4 flex items-center relative z-10 h-full">
        <div className="flex-1 flex flex-col md:flex-row items-center justify-between">
          {/* Left side - Image area (content will be from background) */}
          <div className="hidden md:flex md:flex-1 md:justify-center">
            {/* This div maintains the space for the image content that's now in the background */}
            <div className="w-72 sm:w-80 md:w-96 h-72 sm:h-80 md:h-96 relative">
              {/* Placeholder div to maintain layout structure */}
            </div>
          </div>

          {/* Right content - Center aligned on mobile, right-aligned on desktop */}
          <div className="w-full md:flex-1 md:max-w-lg text-center md:text-left">
            <p className="text-primary font-medium mb-2 text-xs sm:text-sm uppercase tracking-wide">
              WELCOME TO AGRICONNECT
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 md:mb-6 leading-tight">
              Fresh & Healthy<br />
              <span className="text-gray-700">FARM PRODUCTS</span>
            </h1>
            <Link to="/shop">
              <button className="bg-primary hover:bg-secondary text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl mx-auto md:mx-0">
                <span>Shop now</span>
                <span className="text-lg">→</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center mt-6 sm:mt-8 space-x-2 relative z-10">
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full shadow-sm"></div>
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-300 rounded-full shadow-sm hover:bg-gray-400 cursor-pointer transition-colors"></div>
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-300 rounded-full shadow-sm hover:bg-gray-400 cursor-pointer transition-colors"></div>
      </div>
    </section>
  );
};

export default Banner;