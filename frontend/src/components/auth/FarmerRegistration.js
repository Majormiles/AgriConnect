import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        break;
      
      case 2:
        if (!formData.farm.farmName) newErrors.farmName = 'Farm name is required';
        if (!formData.farm.location.region) newErrors.region = 'Region is required';
        if (!formData.farm.location.district) newErrors.district = 'District is required';
        if (!formData.farm.size.value) newErrors.farmSize = 'Farm size is required';
        if (formData.farm.primaryCrops.length === 0) {
          newErrors.primaryCrops = 'At least one crop is required';
        }
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
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    try {
      const response = await registerFarmer(formData);
      if (response.success) {
        navigate('/verify-email', {
          state: { email: formData.email, message: response.message }
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Farmer Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Step {currentStep} of 4
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStep()}
            
            {errors.submit && (
              <div className="text-red-600 text-sm mt-2">
                {errors.submit}
              </div>
            )}

            <div className="flex justify-between mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ml-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isLoading ? 'Registering...' : 'Complete Registration'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FarmerRegistration; 