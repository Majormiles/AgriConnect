import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CreditCard, Building2, Check, AlertCircle, Loader2, Phone, Smartphone, Wallet, Shield } from 'lucide-react';

const PaymentSetup = ({ formData, onChange, errors }) => {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank'); // 'bank' or 'mobile_money'
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [accountVerification, setAccountVerification] = useState({
    isVerifying: false,
    isVerified: false,
    accountName: '',
    error: null
  });
  const [formState, setFormState] = useState({
    businessName: formData.businessProfile?.businessName || '',
    bankAccount: {
      bankName: '',
      bankCode: '',
      accountNumber: '',
      accountName: ''
    },
    mobileMoneyAccount: {
      provider: '',
      phoneNumber: '',
      accountName: ''
    },
    ghanaCardNumber: '',
    tinNumber: '',
    preferredPayoutMethod: 'bank',
    percentageCharge: 10,
    agreedToTerms: false
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  // Ghana-specific mobile money providers
  const mobileMoneyProviders = [
    { 
      code: 'mtn', 
      name: 'MTN Mobile Money', 
      icon: '📱',
      channels: ['mtn'],
      numberFormat: '024, 054, 055, 059'
    },
    { 
      code: 'telecel', 
      name: 'Telecel Cash', 
      icon: '💳',
      channels: ['telecel'],
      numberFormat: '050'
    },
    { 
      code: 'airteltigo', 
      name: 'AirtelTigo Money', 
      icon: '📞',
      channels: ['atl'],
      numberFormat: '026, 056, 027, 057'
    }
  ];

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch supported banks on component mount
  useEffect(() => {
    if (isOnline) {
      fetchSupportedBanks();
    }
  }, [isOnline]);

  const fetchSupportedBanks = async () => {
    try {
      const response = await fetchWithRetry(`${API_URL}/payments/banks`);
      const data = await response.json();
      
      if (data.success) {
        setBanks(data.data);
        // Cache banks data locally
        localStorage.setItem('ghanaBanks', JSON.stringify(data.data));
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      // Try to load cached banks data
      const cachedBanks = localStorage.getItem('ghanaBanks');
      if (cachedBanks) {
        setBanks(JSON.parse(cachedBanks));
      }
    }
  };

  // Exponential backoff retry logic
  const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          timeout: 10000 // 10 second timeout
        });
        
        if (response.ok) {
          setRetryCount(0);
          return response;
        }
        
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        if (i === maxRetries) throw error;
        
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        setRetryCount(i + 1);
      }
    }
  };

  // Validate Ghana phone number format
  const validateGhanaPhoneNumber = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const ghanaPhoneRegex = /^(\+233|0)(2[0-9]|5[0-9])\d{7}$/;
    return ghanaPhoneRegex.test(cleanNumber);
  };

  // Validate Ghana Card number
  const validateGhanaCardNumber = (cardNumber) => {
    const cleanCardNumber = cardNumber.replace(/[\s\-]/g, '');
    // Ghana Card format: GHA-XXXXXXXXX-X
    const ghanaCardRegex = /^GHA\d{9}\d$/;
    return ghanaCardRegex.test(cleanCardNumber);
  };

  // Detect mobile money provider from phone number
  const detectMobileMoneyProvider = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const number = cleanNumber.startsWith('+233') ? cleanNumber.slice(4) : cleanNumber.startsWith('0') ? cleanNumber.slice(1) : cleanNumber;
    
    if (['24', '54', '55', '59'].includes(number.slice(0, 2))) {
      return 'mtn';
    } else if (['50'].includes(number.slice(0, 2))) {
      return 'telecel';
    } else if (['26', '56', '27', '57'].includes(number.slice(0, 2))) {
      return 'airteltigo';
    }
    return '';
  };

  const handleInputChange = (field, value) => {
    // Auto-detect mobile money provider for phone numbers
    if (field === 'mobileMoneyAccount.phoneNumber') {
      const provider = detectMobileMoneyProvider(value);
      setMobileMoneyProvider(provider);
      
      setFormState(prev => ({
        ...prev,
        mobileMoneyAccount: {
          ...prev.mobileMoneyAccount,
          phoneNumber: value,
          provider: provider
        }
      }));
    } else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormState(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Update parent form data
    const updatedData = {
      businessProfile: {
        ...formData.businessProfile,
        businessName: field === 'businessName' ? value : formState.businessName,
        paymentAccount: {
          method: paymentMethod,
          bankAccount: formState.bankAccount,
          mobileMoneyAccount: formState.mobileMoneyAccount,
          ghanaCardNumber: formState.ghanaCardNumber,
          tinNumber: formState.tinNumber,
          preferredPayoutMethod: formState.preferredPayoutMethod
        }
      }
    };

    onChange(4, updatedData);
  };

  const handleBankSelection = (bank) => {
    setSelectedBank(bank);
    setFormState(prev => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        bankName: bank.name,
        bankCode: bank.code
      }
    }));
    
    // Reset verification state when bank changes
    setAccountVerification({
      isVerifying: false,
      isVerified: false,
      accountName: '',
      error: null
    });

    handleInputChange('bankAccount.bankName', bank.name);
    handleInputChange('bankAccount.bankCode', bank.code);
  };

  const verifyBankAccount = async () => {
    if (!isOnline) {
      setAccountVerification(prev => ({
        ...prev,
        error: 'No internet connection. Please check your network and try again.'
      }));
      return;
    }

    if (!formState.bankAccount.accountNumber || !formState.bankAccount.bankCode) {
      setAccountVerification(prev => ({
        ...prev,
        error: 'Please select a bank and enter account number'
      }));
      return;
    }

    setAccountVerification(prev => ({
      ...prev,
      isVerifying: true,
      error: null
    }));

    try {
      const response = await fetchWithRetry(`${API_URL}/payments/verify-bank-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          accountNumber: formState.bankAccount.accountNumber,
          bankCode: formState.bankAccount.bankCode
        })
      });

      const data = await response.json();

      if (data.success) {
        setAccountVerification({
          isVerifying: false,
          isVerified: true,
          accountName: data.data.accountName,
          error: null
        });

        // Update form with verified account name
        setFormState(prev => ({
          ...prev,
          bankAccount: {
            ...prev.bankAccount,
            accountName: data.data.accountName
          }
        }));

        handleInputChange('bankAccount.accountName', data.data.accountName);
      } else {
        setAccountVerification({
          isVerifying: false,
          isVerified: false,
          accountName: '',
          error: data.message || 'Account verification failed'
        });
      }
    } catch (error) {
      setAccountVerification({
        isVerifying: false,
        isVerified: false,
        accountName: '',
        error: `Network error occurred. ${retryCount > 0 ? `Retry attempt ${retryCount}/3. ` : ''}Please try again.`
      });
    }
  };

  // Verify mobile money account (placeholder for now)
  const verifyMobileMoneyAccount = async () => {
    if (!isOnline) {
      setAccountVerification(prev => ({
        ...prev,
        error: 'No internet connection. Please check your network and try again.'
      }));
      return;
    }

    if (!formState.mobileMoneyAccount.phoneNumber || !validateGhanaPhoneNumber(formState.mobileMoneyAccount.phoneNumber)) {
      setAccountVerification(prev => ({
        ...prev,
        error: 'Please enter a valid Ghana phone number'
      }));
      return;
    }

    setAccountVerification(prev => ({
      ...prev,
      isVerifying: true,
      error: null
    }));

    try {
      // This would integrate with actual mobile money verification API
      // For now, we'll simulate the verification
      await new Promise(resolve => setTimeout(resolve, 2000));

      setAccountVerification({
        isVerifying: false,
        isVerified: true,
        accountName: `Mobile Money Account - ${formState.mobileMoneyAccount.phoneNumber}`,
        error: null
      });

      setFormState(prev => ({
        ...prev,
        mobileMoneyAccount: {
          ...prev.mobileMoneyAccount,
          accountName: `Mobile Money Account - ${formState.mobileMoneyAccount.phoneNumber}`
        }
      }));

    } catch (error) {
      setAccountVerification({
        isVerifying: false,
        isVerified: false,
        accountName: '',
        error: 'Mobile money verification failed. Please try again.'
      });
    }
  };

  const isFormValid = () => {
    const basicInfoValid = formState.businessName.trim() && formState.agreedToTerms;
    
    if (paymentMethod === 'bank') {
      return (
        basicInfoValid &&
        formState.bankAccount.bankName &&
        formState.bankAccount.bankCode &&
        formState.bankAccount.accountNumber &&
        accountVerification.isVerified
      );
    } else if (paymentMethod === 'mobile_money') {
      return (
        basicInfoValid &&
        formState.mobileMoneyAccount.phoneNumber &&
        validateGhanaPhoneNumber(formState.mobileMoneyAccount.phoneNumber) &&
        accountVerification.isVerified
      );
    }
    
    return false;
  };

  const getButtonClass = () => {
    const baseClass = "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ";
    
    if (!isOnline) {
      return baseClass + "bg-gray-400 text-white cursor-not-allowed";
    } else if (isFormValid()) {
      return baseClass + "bg-green-600 hover:bg-green-700 text-white shadow-lg transform hover:scale-105";
    } else {
      return baseClass + "bg-gray-300 text-gray-500 cursor-not-allowed";
    }
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    const total = paymentMethod === 'bank' ? 5 : 4;
    
    if (formState.businessName.trim()) completed++;
    if (paymentMethod === 'bank') {
      if (formState.bankAccount.bankName) completed++;
      if (formState.bankAccount.accountNumber) completed++;
    } else {
      if (formState.mobileMoneyAccount.phoneNumber && validateGhanaPhoneNumber(formState.mobileMoneyAccount.phoneNumber)) completed++;
    }
    if (accountVerification.isVerified) completed++;
    if (formState.agreedToTerms) completed++;
    
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Online Status Indicator */}
      {!isOnline && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800">You're offline. Some features may be limited.</span>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-blue-900">Setup Progress</h3>
          <span className="text-sm font-bold text-blue-700">{getCompletionPercentage()}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Business Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-green-600" />
          Business Information
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name *
          </label>
          <input
            type="text"
            value={formState.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter your business/farm name"
          />
          {errors?.businessName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="mr-1 h-4 w-4" />
              {errors.businessName}
            </p>
          )}
        </div>

        {/* Ghana-specific fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Shield className="inline mr-1 h-4 w-4" />
              Ghana Card Number (Optional)
            </label>
            <input
              type="text"
              value={formState.ghanaCardNumber}
              onChange={(e) => handleInputChange('ghanaCardNumber', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="GHA-XXXXXXXXX-X"
            />
            {formState.ghanaCardNumber && !validateGhanaCardNumber(formState.ghanaCardNumber) && (
              <p className="mt-1 text-sm text-yellow-600 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" />
                Invalid Ghana Card format
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TIN Number (Optional)
            </label>
            <input
              type="text"
              value={formState.tinNumber}
              onChange={(e) => handleInputChange('tinNumber', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your TIN number"
            />
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Wallet className="mr-2 h-5 w-5 text-green-600" />
          Payment Method
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setPaymentMethod('bank');
              setAccountVerification({ isVerifying: false, isVerified: false, accountName: '', error: null });
            }}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              paymentMethod === 'bank'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <Building2 className="h-8 w-8" />
            </div>
            <h4 className="font-medium">Bank Account</h4>
            <p className="text-sm text-gray-600 mt-1">Receive payments directly to your bank account</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentMethod('mobile_money');
              setAccountVerification({ isVerifying: false, isVerified: false, accountName: '', error: null });
            }}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              paymentMethod === 'mobile_money'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <Smartphone className="h-8 w-8" />
            </div>
            <h4 className="font-medium">Mobile Money</h4>
            <p className="text-sm text-gray-600 mt-1">Receive payments via MTN, Telecel, or AirtelTigo</p>
          </button>
        </div>
      </div>

      {/* Bank Account Setup */}
      {paymentMethod === 'bank' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 className="mr-2 h-5 w-5 text-green-600" />
            Bank Account Information
          </h3>

        {/* Bank Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Bank *
          </label>
          <select
            value={selectedBank?.code || ''}
            onChange={(e) => {
              const bank = banks.find(b => b.code === e.target.value);
              if (bank) handleBankSelection(bank);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Choose your bank...</option>
            {banks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formState.bankAccount.accountNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormState(prev => ({
                  ...prev,
                  bankAccount: {
                    ...prev.bankAccount,
                    accountNumber: value
                  }
                }));
                handleInputChange('bankAccount.accountNumber', value);
              }}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter 10-digit account number"
              maxLength="10"
            />
            {formState.bankAccount.accountNumber.length === 10 && selectedBank && (
              <button
                type="button"
                onClick={verifyBankAccount}
                disabled={accountVerification.isVerifying}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {accountVerification.isVerifying ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Verify'
                )}
              </button>
            )}
          </div>

          {/* Account Verification Status */}
          {accountVerification.isVerified && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-800">
                <Check className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Account verified: {accountVerification.accountName}</span>
              </div>
            </div>
          )}

          {accountVerification.error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-800">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span className="text-sm">{accountVerification.error}</span>
              </div>
            </div>
          )}
        </div>
        </div>
      )}

      {/* Mobile Money Setup */}
      {paymentMethod === 'mobile_money' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Smartphone className="mr-2 h-5 w-5 text-green-600" />
            Mobile Money Information
          </h3>

          {/* Mobile Money Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mobile Money Provider
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mobileMoneyProviders.map((provider) => (
                <button
                  key={provider.code}
                  type="button"
                  onClick={() => {
                    setMobileMoneyProvider(provider.code);
                    setFormState(prev => ({
                      ...prev,
                      mobileMoneyAccount: {
                        ...prev.mobileMoneyAccount,
                        provider: provider.code
                      }
                    }));
                  }}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    mobileMoneyProvider === provider.code || formState.mobileMoneyAccount.provider === provider.code
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{provider.icon}</div>
                    <div className="font-medium text-sm">{provider.name}</div>
                    <div className="text-xs text-gray-600">{provider.numberFormat}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Money Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={formState.mobileMoneyAccount.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d\+\-\s\(\)]/g, '');
                  handleInputChange('mobileMoneyAccount.phoneNumber', value);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+233 24 XXX XXXX or 024 XXX XXXX"
              />
              {formState.mobileMoneyAccount.phoneNumber && validateGhanaPhoneNumber(formState.mobileMoneyAccount.phoneNumber) && (
                <button
                  type="button"
                  onClick={verifyMobileMoneyAccount}
                  disabled={accountVerification.isVerifying}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {accountVerification.isVerifying ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Verify'
                  )}
                </button>
              )}
            </div>
            
            {/* Phone number validation feedback */}
            {formState.mobileMoneyAccount.phoneNumber && !validateGhanaPhoneNumber(formState.mobileMoneyAccount.phoneNumber) && (
              <p className="mt-1 text-sm text-yellow-600 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" />
                Please enter a valid Ghana phone number (e.g., +233 24 XXX XXXX)
              </p>
            )}

            {/* Auto-detected provider */}
            {mobileMoneyProvider && (
              <p className="mt-1 text-sm text-blue-600 flex items-center">
                <Check className="mr-1 h-4 w-4" />
                Auto-detected: {mobileMoneyProviders.find(p => p.code === mobileMoneyProvider)?.name}
              </p>
            )}

            {/* Account Verification Status */}
            {accountVerification.isVerified && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800">
                  <Check className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">Mobile Money account verified</span>
                </div>
              </div>
            )}

            {accountVerification.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-800">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span className="text-sm">{accountVerification.error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Platform Commission */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-2">Platform Commission</h4>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Platform fee per transaction</span>
          <span className="text-lg font-semibold text-gray-900">{formState.percentageCharge}%</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          This fee helps maintain the platform and provide support services
        </p>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-3">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formState.agreedToTerms}
            onChange={(e) => {
              setFormState(prev => ({
                ...prev,
                agreedToTerms: e.target.checked
              }));
            }}
            className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="#" className="text-green-600 hover:text-green-700 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-green-600 hover:text-green-700 underline">
              Payment Processing Agreement
            </a>
          </span>
        </label>
      </div>

      {/* Completion Status */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Required Information</h4>
        <div className="space-y-2">
          {(() => {
            const baseItems = [
              { label: 'Business Name', completed: !!formState.businessName.trim() },
              { label: 'Terms Agreement', completed: formState.agreedToTerms }
            ];

            const paymentItems = paymentMethod === 'bank' 
              ? [
                  { label: 'Bank Selection', completed: !!formState.bankAccount.bankName },
                  { label: 'Account Number', completed: !!formState.bankAccount.accountNumber },
                  { label: 'Account Verification', completed: accountVerification.isVerified }
                ]
              : [
                  { label: 'Mobile Money Provider', completed: !!formState.mobileMoneyAccount.provider },
                  { label: 'Phone Number', completed: validateGhanaPhoneNumber(formState.mobileMoneyAccount.phoneNumber) },
                  { label: 'Account Verification', completed: accountVerification.isVerified }
                ];

            return [...baseItems.slice(0, 1), ...paymentItems, ...baseItems.slice(1)];
          })().map((item, index) => (
            <div key={index} className="flex items-center">
              {item.completed ? (
                <Check className="h-4 w-4 text-green-600 mr-2" />
              ) : (
                <div className="h-4 w-4 border border-gray-300 rounded-full mr-2"></div>
              )}
              <span className={`text-sm ${item.completed ? 'text-green-700' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Connection Status */}
        {!isOnline && (
          <div className="mt-3 p-2 bg-yellow-100 rounded-md">
            <p className="text-xs text-yellow-800">⚠️ Offline mode - verification may be limited</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          disabled={!isFormValid() || !isOnline}
          className={getButtonClass()}
        >
          {!isOnline ? (
            'Connect to Internet to Continue'
          ) : isFormValid() ? (
            '✅ Complete Payment Setup'
          ) : (
            'Complete Required Fields'
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentSetup; 