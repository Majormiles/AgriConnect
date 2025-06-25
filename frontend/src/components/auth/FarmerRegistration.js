import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Step components
import AccountCredentials from './farmer/AccountCredentials';
import FarmProfile from './farmer/FarmProfile';
import AgriculturalSpecs from './farmer/AgriculturalSpecs';
import BusinessSetup from './farmer/BusinessSetup';

const FarmerRegistration = () => {
  const navigate = useNavigate();
  const { registerFarmer } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState({
    // Step 1: Account Credentials
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    language: 'en',
    
    // Step 2: Farm Profile
    farm: {
      farmName: '',
      location: {
        region: '',
        district: '',
        community: '',
        coordinates: {
          latitude: null,
          longitude: null
        }
      },
      size: {
        value: '',
        unit: 'acres'
      },
      primaryCrops: [],
      yearsOfExperience: '',
      ownershipStatus: ''
    },
    
    // Step 3: Agricultural Specifications
    farmSpecs: {
      soilType: '',
      waterSource: '',
      irrigationMethod: '',
      farmingMethodology: '',
      certifications: [],
      productionCapacity: '',
      seasonalPatterns: []
    },
    
    // Step 4: Business Setup
    businessProfile: {
      paymentMethods: [],
      accountDetails: {
        mobileMoneyProviders: [],
        bankAccounts: []
      },
      transportationCapabilities: '',
      storageAvailable: false,
      marketReach: []
    }
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Account Setup', description: 'Basic credentials' },
    { id: 2, title: 'Farm Profile', description: 'Farm information' },
    { id: 3, title: 'Agricultural Details', description: 'Farming specifications' },
    { id: 4, title: 'Business Setup', description: 'Payment & logistics' }
  ];

  const handleInputChange = (step, data) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
    setErrors({});
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.phoneNumber.match(/^0\d{9}$/)) {
          newErrors.phoneNumber = 'Phone number must start with 0 and be 10 digits';
        }
        break;
      
      case 2:
        if (!formData.farm.farmName) newErrors.farmName = 'Farm name is required';
        if (!formData.farm.location.region) newErrors.region = 'Region is required';
        if (!formData.farm.location.district) newErrors.district = 'District is required';
        if (!formData.farm.size.value) newErrors.farmSize = 'Farm size is required';
        if (formData.farm.primaryCrops.length === 0) {
          newErrors.primaryCrops = 'At least one crop is required';
        }
        if (!formData.farm.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required';
        if (!formData.farm.ownershipStatus) newErrors.ownershipStatus = 'Ownership status is required';
        break;
      
      case 3:
        if (!formData.farmSpecs.soilType) newErrors.soilType = 'Soil type is required';
        if (!formData.farmSpecs.waterSource) newErrors.waterSource = 'Water source is required';
        if (!formData.farmSpecs.farmingMethodology) {
          newErrors.farmingMethodology = 'Farming methodology is required';
        }
        break;
      
      case 4:
        if (formData.businessProfile.paymentMethods.length === 0) {
          newErrors.paymentMethods = 'At least one payment method is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleStepClick = (stepId) => {
    if (stepId < currentStep || completedSteps.includes(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    try {
      const response = await registerFarmer(formData);
      if (response.success) {
        navigate('/verify-email', {
          state: { 
            email: formData.email, 
            message: response.message,
            userType: 'farmer' 
          }
        });
      }
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AccountCredentials
            formData={formData}
            onChange={handleInputChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <FarmProfile
            formData={formData}
            onChange={handleInputChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <AgriculturalSpecs
            formData={formData}
            onChange={handleInputChange}
            errors={errors}
          />
        );
      case 4:
        return (
          <BusinessSetup
            formData={formData}
            onChange={handleInputChange}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
        <Link to="/">
            <div className="bg-green-600 p-3 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
        </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join AgriConnect as a Farmer</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete your registration to start selling your agricultural products to a wide network of buyers across Ghana.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          {/* Mobile Progress - Simple */}
          <div className="block md:hidden mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {steps.length}</span>
              <span className="font-medium">{steps[currentStep - 1].title}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Desktop Progress - Full */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => handleStepClick(step.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep === step.id
                        ? 'bg-green-600 text-white'
                        : completedSteps.includes(step.id)
                        ? 'bg-green-100 text-green-600 border-2 border-green-600'
                        : 'bg-gray-200 text-gray-500'
                    } ${step.id < currentStep || completedSteps.includes(step.id) ? 'cursor-pointer hover:bg-green-700' : 'cursor-default'}`}
                  >
                    {completedSteps.includes(step.id) ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </button>
                  <div className="text-center mt-2">
                    <div className={`font-medium text-sm ${currentStep === step.id ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400 hidden lg:block">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Progress Line */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full bg-gray-200 h-1 rounded-full">
                <div 
                  className="bg-green-600 h-1 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-gray-600 text-sm">
                  {steps[currentStep - 1].description}
                </p>
              </div>

              {renderStep()}
              
              {errors.submit && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-red-700 text-sm">{errors.submit}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="pt-6 border-t border-gray-200">
                {/* Mobile Layout */}
                <div className="block sm:hidden space-y-3">
                  <div className="text-center">
                    <Link 
                      to="/login" 
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Already have an account? Login
                    </Link>
                  </div>
                  
                  <div className="flex space-x-3">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                    )}
                    
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Next
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="hidden xs:inline">Registering...</span>
                            <span className="xs:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden xs:inline">Complete Registration</span>
                            <span className="xs:hidden">Complete</span>
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Link 
                      to="/login" 
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Already have an account? Login
                    </Link>
                    
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Next
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Registering...
                          </>
                        ) : (
                          <>
                            Complete Registration
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <Link to="/" className="hover:text-green-600 mr-4">Back to Home</Link>
          <span className="mx-2">•</span>
          <Link to="/register" className="hover:text-green-600 mr-4">Join as Buyer</Link>
          <span className="mx-2">•</span>
          <Link to="/help" className="hover:text-green-600">Need Help?</Link>
        </div>
      </div>
    </div>
  );
};

export default FarmerRegistration; 