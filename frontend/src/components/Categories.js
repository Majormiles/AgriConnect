import React from 'react';

// Categories Component
const Categories = () => {
  const categories = [
    { 
      name: 'Vegetables', 
      count: '165 Products', 
      image: '/categories/Vegetable.png', 
      color: 'bg-gray-50',
      border: 'border-green-500'
    },
    { 
      name: 'Fresh Fruit', 
      count: '137 Products', 
      image: '/categories/fruits.png', 
      color: 'bg-gray-50',
      border: 'border-gray-200'
    },
    { 
      name: 'Fish', 
      count: '34 Products', 
      image: '/categories/fish.png', 
      color: 'bg-gray-50',
      border: 'border-gray-200'
    },
    { 
      name: 'Meat', 
      count: '165 Products', 
      image: '/categories/meat.png', 
      color: 'bg-gray-50',
      border: 'border-gray-200'
    },
    { 
      name: 'Water and Drinks', 
      count: '48 Products', 
      image: '/categories/drinks.png', 
      color: 'bg-gray-50',
      border: 'border-gray-200'
    },
    { 
      name: 'Snacks', 
      count: '165 Products', 
      image: '/categories/snacks.png', 
      color: 'bg-gray-50',
      border: 'border-gray-200'
    }
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Decorative leaf */}
      <div className="absolute bottom-10 right-10 w-16 h-16 text-green-400 transform rotate-12">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
        </svg>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Shop by Top Categories</h2>
          <button className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-2 text-lg">
            <span>View All</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Navigation arrows and categories container */}
        <div className="relative">
          {/* Left arrow */}
          <button className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right arrow */}
          <button className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Categories grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 px-8">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className={`${category.color} ${category.border} border-2 rounded-2xl p-6 text-center hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
              >
                <div className="mb-4 flex justify-center">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  {/* Fallback text if image fails to load */}
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs hidden">
                    No Image
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 text-sm">{category.name}</h3>
                <p className="text-xs text-gray-500">{category.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;