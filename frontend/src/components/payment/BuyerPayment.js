import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Check, AlertCircle, Loader2, Shield, Info, Smartphone, Building2, Wallet, Phone } from 'lucide-react';

const BuyerPayment = ({ 
  orderData, 
  farmerId, 
  onSuccess, 
  onError, 
  isProcessing = false 
}) => {
  const [paymentState, setPaymentState] = useState({
    amount: orderData?.amount || 0,
    email: '',
    phoneNumber: '',
    paymentMethod: 'card', // 'card', 'mobile_money', 'bank_transfer'
    mobileMoneyProvider: '',
    isLoading: false,
    error: null,
    paymentReference: null,
    paymentStatus: 'pending', // pending, processing, success, failed
    isOnline: navigator.onLine
  });

  const [formValidation, setFormValidation] = useState({
    email: { isValid: false, error: '' },
    phoneNumber: { isValid: false, error: '' },
    terms: { isValid: false, error: '' }
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  // Ghana-specific mobile money providers
  const mobileMoneyProviders = [
    { 
      code: 'mtn', 
      name: 'MTN Mobile Money', 
      icon: '📱',
      channels: ['mtn'],
      numberFormat: '024, 054, 055, 059',
      color: 'yellow'
    },
    { 
      code: 'telecel', 
      name: 'Telecel Cash', 
      icon: '💳',
      channels: ['telecel'],
      numberFormat: '050',
      color: 'red'
    },
    { 
      code: 'airteltigo', 
      name: 'AirtelTigo Money', 
      icon: '📞',
      channels: ['atl'],
      numberFormat: '026, 056, 027, 057',
      color: 'blue'
    }
  ];

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setPaymentState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPaymentState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Load Paystack inline script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Validate Ghana phone number format
  const validateGhanaPhoneNumber = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const ghanaPhoneRegex = /^(\+233|0)(2[0-9]|5[0-9])\d{7}$/;
    return ghanaPhoneRegex.test(cleanNumber);
  };

  // Detect mobile money provider from phone number
  const detectMobileMoneyProvider = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const number = cleanNumber.startsWith('+233') ? cleanNumber.slice(4) : 
                   cleanNumber.startsWith('0') ? cleanNumber.slice(1) : cleanNumber;
    
    if (['24', '54', '55', '59'].includes(number.slice(0, 2))) {
      return 'mtn';
    } else if (['50'].includes(number.slice(0, 2))) {
      return 'telecel';
    } else if (['26', '56', '27', '57'].includes(number.slice(0, 2))) {
      return 'airteltigo';
    }
    return '';
  };

  // Real-time email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(paymentState.email);
    
    setFormValidation(prev => ({
      ...prev,
      email: {
        isValid,
        error: paymentState.email && !isValid ? 'Please enter a valid email address' : ''
      }
    }));
  }, [paymentState.email]);

  // Real-time phone number validation
  useEffect(() => {
    if (paymentState.paymentMethod === 'mobile_money') {
      const isValid = validateGhanaPhoneNumber(paymentState.phoneNumber);
      const detectedProvider = isValid ? detectMobileMoneyProvider(paymentState.phoneNumber) : '';
      
      setFormValidation(prev => ({
        ...prev,
        phoneNumber: {
          isValid,
          error: paymentState.phoneNumber && !isValid ? 'Please enter a valid Ghana phone number' : ''
        }
      }));

      // Auto-detect and set mobile money provider
      if (detectedProvider && detectedProvider !== paymentState.mobileMoneyProvider) {
        setPaymentState(prev => ({
          ...prev,
          mobileMoneyProvider: detectedProvider
        }));
      }
    } else {
      setFormValidation(prev => ({
        ...prev,
        phoneNumber: { isValid: true, error: '' }
      }));
    }
  }, [paymentState.phoneNumber, paymentState.paymentMethod]);

  // Terms validation
  useEffect(() => {
    setFormValidation(prev => ({
      ...prev,
      terms: {
        isValid: agreedToTerms,
        error: ''
      }
    }));
  }, [agreedToTerms]);

  const isFormValid = () => {
    const baseValid = formValidation.email.isValid && 
                      formValidation.terms.isValid && 
                      paymentState.amount > 0 &&
                      paymentState.isOnline;

    if (paymentState.paymentMethod === 'mobile_money') {
      return baseValid && formValidation.phoneNumber.isValid && paymentState.mobileMoneyProvider;
    }

    return baseValid;
  };

  const getButtonState = () => {
    if (paymentState.isLoading || isProcessing) {
      return {
        disabled: true,
        text: 'Processing...',
        className: 'bg-gray-400 cursor-not-allowed',
        icon: <Loader2 className="w-5 h-5 animate-spin" />
      };
    }
    
    if (!paymentState.isOnline) {
      return {
        disabled: true,
        text: 'No Internet Connection',
        className: 'bg-red-400 text-white cursor-not-allowed',
        icon: <AlertCircle className="w-5 h-5" />
      };
    }
    
    if (!isFormValid()) {
      const missingField = !formValidation.email.isValid ? 'email' :
                          paymentState.paymentMethod === 'mobile_money' && !formValidation.phoneNumber.isValid ? 'phone number' :
                          !paymentState.mobileMoneyProvider && paymentState.paymentMethod === 'mobile_money' ? 'mobile money provider' :
                          !formValidation.terms.isValid ? 'terms agreement' : 'form';
      
      return {
        disabled: true,
        text: `Enter valid ${missingField}`,
        className: 'bg-gray-300 text-gray-500 cursor-not-allowed',
        icon: <AlertCircle className="w-5 h-5" />
      };
    }
    
    const paymentIcon = paymentState.paymentMethod === 'mobile_money' ? 
                       <Smartphone className="w-5 h-5" /> : 
                       paymentState.paymentMethod === 'bank_transfer' ? 
                       <Building2 className="w-5 h-5" /> : 
                       <CreditCard className="w-5 h-5" />;
    
    return {
      disabled: false,
      text: `Pay GH₵${paymentState.amount.toFixed(2)} ${paymentState.paymentMethod === 'mobile_money' ? 'via Mobile Money' : ''}`,
      className: 'bg-green-600 hover:bg-green-700 text-white shadow-lg transform hover:scale-105',
      icon: paymentIcon
    };
  };

  const initializePayment = async () => {
    setPaymentState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Please log in to continue with payment');
      }

      const response = await fetch(`${API_URL}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: paymentState.amount,
          farmerId,
          orderId: orderData?.orderId,
          paymentMethod: paymentState.paymentMethod,
          mobileMoneyProvider: paymentState.mobileMoneyProvider,
          phoneNumber: paymentState.phoneNumber,
          metadata: {
            customer_email: paymentState.email,
            customer_phone: paymentState.phoneNumber,
            payment_method: paymentState.paymentMethod,
            mobile_money_provider: paymentState.mobileMoneyProvider,
            order_description: orderData?.description || 'Agricultural product purchase',
            farm_name: orderData?.farmName,
            product_names: orderData?.productNames || []
          }
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Payment initialization failed');
      }

      setPaymentState(prev => ({ 
        ...prev, 
        isLoading: false, 
        paymentReference: data.data.reference 
      }));

      // Launch Paystack popup
      launchPaystackPopup(data.data);

    } catch (error) {
      setPaymentState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message 
      }));
      
      if (onError) {
        onError(error.message);
      }
    }
  };

  const launchPaystackPopup = (paymentData) => {
    const popupConfig = {
      key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_test_6134da91ac4299dd1b3e12340329c5fbb6794acc',
      email: paymentState.email,
      amount: Math.round(paymentState.amount * 100), // Convert to pesewas
      currency: 'GHS',
      ref: paymentData.reference,
      
      onClose: () => {
        setPaymentState(prev => ({ 
          ...prev, 
          paymentStatus: 'cancelled' 
        }));
        console.log('Payment popup was closed');
      },
      
      onSuccess: (transaction) => {
        setPaymentState(prev => ({ 
          ...prev, 
          paymentStatus: 'processing' 
        }));
        verifyPayment(transaction.reference);
      },

      metadata: {
        payment_method: paymentState.paymentMethod,
        mobile_money_provider: paymentState.mobileMoneyProvider,
        customer_phone: paymentState.phoneNumber
      }
    };

    // Add channels based on payment method
    if (paymentState.paymentMethod === 'mobile_money' && paymentState.mobileMoneyProvider) {
      const provider = mobileMoneyProviders.find(p => p.code === paymentState.mobileMoneyProvider);
      if (provider) {
        popupConfig.channels = provider.channels;
      }
    } else if (paymentState.paymentMethod === 'bank_transfer') {
      popupConfig.channels = ['bank'];
    } else if (paymentState.paymentMethod === 'card') {
      popupConfig.channels = ['card'];
    }

    // Add phone number for mobile money
    if (paymentState.paymentMethod === 'mobile_money' && paymentState.phoneNumber) {
      popupConfig.phone = paymentState.phoneNumber;
    }

    const handler = window.PaystackPop.setup(popupConfig);
    handler.openIframe();
  };

  const verifyPayment = async (reference) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success && data.data.status === 'success') {
        setPaymentState(prev => ({ 
          ...prev, 
          paymentStatus: 'success' 
        }));
        
        if (onSuccess) {
          onSuccess({
            reference: data.data.reference,
            amount: data.data.amount,
            status: data.data.status,
            paidAt: data.data.paidAt,
            channel: data.data.channel
          });
        }
      } else {
        throw new Error(data.message || 'Payment verification failed');
      }
    } catch (error) {
      setPaymentState(prev => ({ 
        ...prev, 
        paymentStatus: 'failed',
        error: error.message 
      }));
      
      if (onError) {
        onError(error.message);
      }
    }
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 4; // Base requirements: email, amount, payment method, terms
    
    if (formValidation.email.isValid) completed++;
    if (paymentState.amount > 0) completed++;
    if (paymentState.paymentMethod) completed++;
    if (agreedToTerms) completed++;
    
    // Additional requirement for mobile money
    if (paymentState.paymentMethod === 'mobile_money') {
      total = 6; // Add phone number and provider selection
      if (formValidation.phoneNumber.isValid) completed++;
      if (paymentState.mobileMoneyProvider) completed++;
    }
    
    return Math.round((completed / total) * 100);
  };

  const buttonState = getButtonState();

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Secure Payment</h2>
        <p className="text-gray-600 text-sm">
          Complete your purchase safely with Paystack
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-blue-900">Payment Progress</h3>
          <span className="text-sm font-bold text-blue-700">{getCompletionPercentage()}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
        
        {orderData?.items?.map((item, index) => (
          <div key={index} className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">{item.name} x {item.quantity}</span>
            <span className="font-medium">GH₵{item.total.toFixed(2)}</span>
          </div>
        ))}
        
        <div className="border-t border-gray-200 pt-2 mt-3">
          <div className="flex justify-between font-semibold">
            <span>Total Amount</span>
            <span className="text-green-600">GH₵{paymentState.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Online Status */}
      {!paymentState.isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">You're offline. Please check your internet connection.</span>
          </div>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Wallet className="mr-2 h-5 w-5 text-green-600" />
          Choose Payment Method
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {/* Card Payment */}
          <button
            type="button"
            onClick={() => setPaymentState(prev => ({ ...prev, paymentMethod: 'card' }))}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              paymentState.paymentMethod === 'card'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 mr-3 text-blue-600" />
              <div>
                <h4 className="font-medium">Card Payment</h4>
                <p className="text-sm text-gray-600">Pay with Visa, Mastercard, or other cards</p>
              </div>
            </div>
          </button>

          {/* Mobile Money */}
          <button
            type="button"
            onClick={() => setPaymentState(prev => ({ ...prev, paymentMethod: 'mobile_money' }))}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              paymentState.paymentMethod === 'mobile_money'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center">
              <Smartphone className="h-6 w-6 mr-3 text-green-600" />
              <div>
                <h4 className="font-medium">Mobile Money</h4>
                <p className="text-sm text-gray-600">Pay with MTN, Telecel, or AirtelTigo</p>
              </div>
            </div>
          </button>

          {/* Bank Transfer */}
          <button
            type="button"
            onClick={() => setPaymentState(prev => ({ ...prev, paymentMethod: 'bank_transfer' }))}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              paymentState.paymentMethod === 'bank_transfer'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center">
              <Building2 className="h-6 w-6 mr-3 text-purple-600" />
              <div>
                <h4 className="font-medium">Bank Transfer</h4>
                <p className="text-sm text-gray-600">Direct transfer from your bank account</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Money Provider Selection */}
      {paymentState.paymentMethod === 'mobile_money' && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Select Mobile Money Provider</h4>
          <div className="grid grid-cols-3 gap-3">
            {mobileMoneyProviders.map((provider) => (
              <button
                key={provider.code}
                type="button"
                onClick={() => setPaymentState(prev => ({ ...prev, mobileMoneyProvider: provider.code }))}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  paymentState.mobileMoneyProvider === provider.code
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{provider.icon}</div>
                  <div className="font-medium text-sm">{provider.name.split(' ')[0]}</div>
                  <div className="text-xs text-gray-600">{provider.numberFormat}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Payment Form */}
      <div className="space-y-4">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={paymentState.email}
            onChange={(e) => setPaymentState(prev => ({ 
              ...prev, 
              email: e.target.value 
            }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              formValidation.email.error ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="your.email@example.com"
          />
          {formValidation.email.error && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="mr-1 h-4 w-4" />
              {formValidation.email.error}
            </p>
          )}
          {formValidation.email.isValid && (
            <p className="mt-1 text-sm text-green-600 flex items-center">
              <Check className="mr-1 h-4 w-4" />
              Valid email address
            </p>
          )}
        </div>

        {/* Phone Number Input (for Mobile Money) */}
        {paymentState.paymentMethod === 'mobile_money' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="inline mr-1 h-4 w-4" />
              Mobile Money Phone Number *
            </label>
            <input
              type="tel"
              value={paymentState.phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d\+\-\s\(\)]/g, '');
                setPaymentState(prev => ({ ...prev, phoneNumber: value }));
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                formValidation.phoneNumber.error ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+233 24 XXX XXXX or 024 XXX XXXX"
            />
            {formValidation.phoneNumber.error && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" />
                {formValidation.phoneNumber.error}
              </p>
            )}
            {formValidation.phoneNumber.isValid && paymentState.mobileMoneyProvider && (
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <Check className="mr-1 h-4 w-4" />
                Valid number - Auto-detected: {mobileMoneyProviders.find(p => p.code === paymentState.mobileMoneyProvider)?.name}
              </p>
            )}
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Secure Payment</h4>
              <p className="text-xs text-yellow-700 mt-1">
                Your payment is secured by Paystack's industry-standard encryption.
                Your card details are never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-3">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              I agree to the{' '}
              <a href="#" className="text-green-600 hover:text-green-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-green-600 hover:text-green-700 underline">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        {/* Error Display */}
        {paymentState.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center text-red-800">
              <AlertCircle className="mr-2 h-4 w-4" />
              <span className="text-sm">{paymentState.error}</span>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={initializePayment}
          disabled={buttonState.disabled}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${buttonState.className}`}
        >
          {buttonState.icon}
          <span className="ml-2">{buttonState.text}</span>
        </button>

        {/* Payment Methods */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 mb-2">Accepted Payment Methods</p>
          <div className="flex justify-center space-x-2">
            <div className="bg-gray-100 px-2 py-1 rounded text-xs">Visa</div>
            <div className="bg-gray-100 px-2 py-1 rounded text-xs">Mastercard</div>
            <div className="bg-gray-100 px-2 py-1 rounded text-xs">Mobile Money</div>
            <div className="bg-gray-100 px-2 py-1 rounded text-xs">Bank Transfer</div>
          </div>
        </div>
      </div>

      {/* Completion Status */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Payment Checklist</h4>
        <div className="space-y-2">
          {(() => {
            const baseItems = [
              { label: 'Valid Email', completed: formValidation.email.isValid },
              { label: 'Amount Confirmed', completed: paymentState.amount > 0 },
              { label: 'Payment Method Selected', completed: !!paymentState.paymentMethod },
              { label: 'Terms Accepted', completed: agreedToTerms }
            ];

            const mobileMoneyItems = paymentState.paymentMethod === 'mobile_money' ? [
              { label: 'Valid Phone Number', completed: formValidation.phoneNumber.isValid },
              { label: 'Provider Selected', completed: !!paymentState.mobileMoneyProvider }
            ] : [];

            return [...baseItems.slice(0, 3), ...mobileMoneyItems, ...baseItems.slice(3)];
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
      </div>
    </div>
  );
};

export default BuyerPayment; 