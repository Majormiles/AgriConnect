import React from 'react';

// Features Component
const Features = () => {
  const features = [
    {
      icon: '/images/features/Icon1.png',
      title: 'Free Shipping',
      description: 'Free shipping with discount',
      bgColor: 'bg-green-100'
    },
    {
      icon: '/images/features/Icon2.png',
      title: 'Great Support 24/7',
      description: 'Instant access to Contact',
      bgColor: 'bg-green-100'
    },
    {
      icon: '/images/features/Icon3.png',
      title: '100% Secure Payment',
      description: 'We ensure your money is save',
      bgColor: 'bg-green-600'
    },
    {
      icon: '/images/features/Icon4.png',
      title: 'Money-Back Guarantee',
      description: '30 days money-back',
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-all duration-300 group">
              {/* Icon Container */}
              <div className={`w-20 h-20 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <img 
                  src={feature.icon} 
                  alt={feature.title}
                  className={`w-10 h-10 object-contain ${index === 2 ? 'filter brightness-0 invert' : ''}`}
                />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;