/**
 * Payment Validation Utilities
 * Provides comprehensive validation for payment-related forms and data
 */

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    error: email && !isValid ? 'Please enter a valid email address' : '',
    suggestions: !isValid && email ? getEmailSuggestions(email) : []
  };
};

// Phone number validation (Ghana format)
export const validatePhoneNumber = (phoneNumber) => {
  const ghanaPhoneRegex = /^0\d{9}$/;
  const isValid = ghanaPhoneRegex.test(phoneNumber);
  
  return {
    isValid,
    error: phoneNumber && !isValid ? 'Phone number must start with 0 and be 10 digits' : '',
    formatted: formatPhoneNumber(phoneNumber)
  };
};

// Bank account number validation
export const validateBankAccount = (accountNumber) => {
  const accountRegex = /^\d{10}$/;
  const isValid = accountRegex.test(accountNumber);
  
  return {
    isValid,
    error: accountNumber && !isValid ? 'Account number must be exactly 10 digits' : '',
    formatted: formatAccountNumber(accountNumber)
  };
};

// Amount validation
export const validateAmount = (amount, minAmount = 1, maxAmount = 1000000) => {
  const numAmount = parseFloat(amount);
  const isValid = !isNaN(numAmount) && numAmount >= minAmount && numAmount <= maxAmount;
  
  let error = '';
  if (amount && isNaN(numAmount)) {
    error = 'Please enter a valid amount';
  } else if (amount && numAmount < minAmount) {
    error = `Amount must be at least GH₵${minAmount}`;
  } else if (amount && numAmount > maxAmount) {
    error = `Amount cannot exceed GH₵${maxAmount.toLocaleString()}`;
  }
  
  return {
    isValid,
    error,
    formatted: formatCurrency(numAmount)
  };
};

// Business name validation
export const validateBusinessName = (businessName) => {
  const minLength = 2;
  const maxLength = 100;
  const isValid = businessName && 
                  businessName.trim().length >= minLength && 
                  businessName.trim().length <= maxLength;
  
  let error = '';
  if (!businessName || businessName.trim().length === 0) {
    error = 'Business name is required';
  } else if (businessName.trim().length < minLength) {
    error = `Business name must be at least ${minLength} characters`;
  } else if (businessName.trim().length > maxLength) {
    error = `Business name cannot exceed ${maxLength} characters`;
  }
  
  return {
    isValid,
    error,
    suggestions: getBusinessNameSuggestions(businessName)
  };
};

// Password strength validation
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, password?.length >= minLength]
    .filter(Boolean).length;
  
  const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
  const isValid = score >= 4 && password?.length >= minLength;
  
  const suggestions = [];
  if (!hasUpperCase) suggestions.push('Add uppercase letters');
  if (!hasLowerCase) suggestions.push('Add lowercase letters');
  if (!hasNumbers) suggestions.push('Add numbers');
  if (!hasSpecialChar) suggestions.push('Add special characters');
  if (password?.length < minLength) suggestions.push(`Use at least ${minLength} characters`);
  
  return {
    isValid,
    strength,
    score,
    suggestions,
    error: !isValid && password ? 'Password is too weak' : ''
  };
};

// Payment form comprehensive validation
export const validatePaymentForm = (formData) => {
  const validations = {
    email: validateEmail(formData.email),
    amount: validateAmount(formData.amount),
    terms: {
      isValid: formData.agreedToTerms === true,
      error: !formData.agreedToTerms ? 'You must agree to the terms and conditions' : ''
    }
  };
  
  // Add conditional validations
  if (formData.phoneNumber) {
    validations.phoneNumber = validatePhoneNumber(formData.phoneNumber);
  }
  
  if (formData.businessName) {
    validations.businessName = validateBusinessName(formData.businessName);
  }
  
  const allValid = Object.values(validations).every(v => v.isValid);
  const errors = Object.entries(validations)
    .filter(([key, validation]) => !validation.isValid && validation.error)
    .reduce((acc, [key, validation]) => {
      acc[key] = validation.error;
      return acc;
    }, {});
  
  return {
    isValid: allValid,
    errors,
    validations,
    completionPercentage: getCompletionPercentage(validations)
  };
};

// Farmer payment account validation
export const validateFarmerAccount = (accountData) => {
  const validations = {
    businessName: validateBusinessName(accountData.businessName),
    bankName: {
      isValid: !!accountData.bankAccount?.bankName,
      error: !accountData.bankAccount?.bankName ? 'Bank selection is required' : ''
    },
    accountNumber: validateBankAccount(accountData.bankAccount?.accountNumber),
    accountName: {
      isValid: !!accountData.bankAccount?.accountName,
      error: !accountData.bankAccount?.accountName ? 'Account verification is required' : ''
    },
    terms: {
      isValid: accountData.agreedToTerms === true,
      error: !accountData.agreedToTerms ? 'You must agree to the payment terms' : ''
    }
  };
  
  const allValid = Object.values(validations).every(v => v.isValid);
  const errors = Object.entries(validations)
    .filter(([key, validation]) => !validation.isValid && validation.error)
    .reduce((acc, [key, validation]) => {
      acc[key] = validation.error;
      return acc;
    }, {});
  
  return {
    isValid: allValid,
    errors,
    validations,
    completionPercentage: getCompletionPercentage(validations)
  };
};

// Real-time validation with debouncing
export const createDebouncedValidator = (validationFn, delay = 300) => {
  let timeoutId;
  
  return (value, callback) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validationFn(value);
      callback(result);
    }, delay);
  };
};

// Helper functions
function getEmailSuggestions(email) {
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const [localPart, domain] = email.split('@');
  
  if (!domain) return [];
  
  return commonDomains
    .filter(d => d.startsWith(domain.toLowerCase()))
    .map(d => `${localPart}@${d}`)
    .slice(0, 3);
}

function getBusinessNameSuggestions(name) {
  if (!name || name.length < 2) return [];
  
  const suggestions = [
    `${name} Farm`,
    `${name} Agricultural Services`,
    `${name} Agro Business`,
    `${name} Organic Farm`
  ];
  
  return suggestions.filter(s => s.toLowerCase() !== name.toLowerCase()).slice(0, 2);
}

function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';
  
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  return phoneNumber;
}

function formatAccountNumber(accountNumber) {
  if (!accountNumber) return '';
  
  const cleaned = accountNumber.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  return accountNumber;
}

function formatCurrency(amount) {
  if (isNaN(amount)) return '';
  
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function getCompletionPercentage(validations) {
  const total = Object.keys(validations).length;
  const completed = Object.values(validations).filter(v => v.isValid).length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

// Payment status utilities
export const getPaymentStatusInfo = (status) => {
  const statusConfig = {
    pending: {
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      message: 'Payment is being processed',
      canCancel: true,
      canRefund: false
    },
    processing: {
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
      message: 'Payment is being verified',
      canCancel: false,
      canRefund: false
    },
    success: {
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      message: 'Payment completed successfully',
      canCancel: false,
      canRefund: true
    },
    failed: {
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      message: 'Payment failed',
      canCancel: false,
      canRefund: false
    },
    cancelled: {
      color: 'gray',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200',
      message: 'Payment was cancelled',
      canCancel: false,
      canRefund: false
    },
    refunded: {
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-200',
      message: 'Payment has been refunded',
      canCancel: false,
      canRefund: false
    }
  };
  
  return statusConfig[status] || statusConfig.pending;
};

// Button state management for dynamic UX
export const getButtonState = (validationResult, isLoading = false, customText = null) => {
  if (isLoading) {
    return {
      disabled: true,
      text: 'Processing...',
      className: 'bg-gray-400 cursor-not-allowed text-white',
      showSpinner: true
    };
  }
  
  if (!validationResult.isValid) {
    const errorCount = Object.keys(validationResult.errors).length;
    return {
      disabled: true,
      text: customText || `Complete ${errorCount} field${errorCount > 1 ? 's' : ''} to continue`,
      className: 'bg-gray-300 text-gray-500 cursor-not-allowed',
      showSpinner: false
    };
  }
  
  return {
    disabled: false,
    text: customText || 'Continue',
    className: 'bg-green-600 hover:bg-green-700 text-white shadow-lg transform hover:scale-105',
    showSpinner: false
  };
};

// Export all validation functions
export default {
  validateEmail,
  validatePhoneNumber,
  validateBankAccount,
  validateAmount,
  validateBusinessName,
  validatePasswordStrength,
  validatePaymentForm,
  validateFarmerAccount,
  createDebouncedValidator,
  getPaymentStatusInfo,
  getButtonState,
  formatCurrency
}; 