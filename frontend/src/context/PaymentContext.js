import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Create payment context
const PaymentContext = createContext();

// Payment provider component
export const PaymentProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [paymentState, setPaymentState] = useState({
    // Farmer payment account
    farmerAccount: null,
    isAccountSetup: false,
    accountVerificationStatus: 'pending',
    
    // Payment transactions
    transactions: [],
    totalEarnings: 0,
    
    // UI states
    isLoading: false,
    error: null,
    
    // Current payment process
    currentPayment: null,
    paymentStatus: 'idle' // idle, processing, success, failed
  });

  const API_URL = 'http://localhost:5001/api';

  // Load payment data when user changes
  useEffect(() => {
    if (currentUser && currentUser.role === 'farmer') {
      loadFarmerPaymentAccount();
      loadPaymentTransactions();
    } else if (currentUser) {
      loadPaymentTransactions();
    }
  }, [currentUser]);

  // Load farmer payment account
  const loadFarmerPaymentAccount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/farmer/account`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setPaymentState(prev => ({
          ...prev,
          farmerAccount: data.data,
          isAccountSetup: true,
          accountVerificationStatus: data.data.verificationStatus,
          totalEarnings: data.data.totalEarnings || 0
        }));
      } else {
        setPaymentState(prev => ({
          ...prev,
          isAccountSetup: false
        }));
      }
    } catch (error) {
      console.error('Error loading farmer payment account:', error);
      setPaymentState(prev => ({
        ...prev,
        error: 'Failed to load payment account information'
      }));
    }
  };

  // Load payment transactions
  const loadPaymentTransactions = async (filters = {}) => {
    setPaymentState(prev => ({ ...prev, isLoading: true }));

    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 20,
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type })
      });

      const response = await fetch(`${API_URL}/payments/transactions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setPaymentState(prev => ({
          ...prev,
          transactions: data.data,
          isLoading: false
        }));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setPaymentState(prev => ({
        ...prev,
        error: 'Failed to load transaction history',
        isLoading: false
      }));
    }
  };

  // Setup farmer payment account
  const setupFarmerPaymentAccount = async (accountData) => {
    setPaymentState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/farmer/setup-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(accountData)
      });

      const data = await response.json();

      if (data.success) {
        setPaymentState(prev => ({
          ...prev,
          farmerAccount: data.data,
          isAccountSetup: true,
          accountVerificationStatus: 'pending',
          isLoading: false
        }));

        return { success: true, data: data.data };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setPaymentState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));

      return { success: false, message: error.message };
    }
  };

  // Verify bank account
  const verifyBankAccount = async (accountNumber, bankCode) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/verify-bank-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accountNumber, bankCode })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          accountName: data.data.accountName,
          accountNumber: data.data.accountNumber
        };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  };

  // Initialize payment
  const initializePayment = async (paymentData) => {
    setPaymentState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      paymentStatus: 'processing'
    }));

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (data.success) {
        setPaymentState(prev => ({
          ...prev,
          currentPayment: data.data,
          isLoading: false
        }));

        return { success: true, data: data.data };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setPaymentState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
        paymentStatus: 'failed'
      }));

      return { success: false, message: error.message };
    }
  };

  // Verify payment
  const verifyPayment = async (reference) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setPaymentState(prev => ({
          ...prev,
          paymentStatus: data.data.status === 'success' ? 'success' : 'failed'
        }));

        // Reload transactions to get the latest data
        loadPaymentTransactions();

        return { success: true, data: data.data };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setPaymentState(prev => ({
        ...prev,
        paymentStatus: 'failed',
        error: error.message
      }));

      return { success: false, message: error.message };
    }
  };

  // Process refund
  const processRefund = async (transactionId, amount, reason) => {
    setPaymentState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          transactionId,
          amount,
          reason
        })
      });

      const data = await response.json();

      if (data.success) {
        setPaymentState(prev => ({
          ...prev,
          isLoading: false
        }));

        // Reload transactions to reflect the refund
        loadPaymentTransactions();

        return { success: true, data: data.data };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setPaymentState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));

      return { success: false, message: error.message };
    }
  };

  // Get supported banks
  const getSupportedBanks = async () => {
    try {
      const response = await fetch(`${API_URL}/payments/banks`);
      const data = await response.json();

      if (data.success) {
        return { success: true, banks: data.data };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    setPaymentState(prev => ({ ...prev, error: null }));
  };

  // Reset payment status
  const resetPaymentStatus = () => {
    setPaymentState(prev => ({
      ...prev,
      paymentStatus: 'idle',
      currentPayment: null,
      error: null
    }));
  };

  // Calculate payment summary for farmers
  const getPaymentSummary = () => {
    if (!paymentState.transactions || paymentState.transactions.length === 0) {
      return {
        totalEarnings: 0,
        totalTransactions: 0,
        successfulPayments: 0,
        pendingPayments: 0,
        averageTransactionAmount: 0
      };
    }

    const farmerTransactions = paymentState.transactions.filter(
      tx => tx.farmerId === currentUser?.id && tx.status === 'success'
    );

    const totalEarnings = farmerTransactions.reduce((sum, tx) => sum + (tx.farmerAmount || 0), 0);
    const totalTransactions = farmerTransactions.length;
    const successfulPayments = farmerTransactions.filter(tx => tx.status === 'success').length;
    const pendingPayments = paymentState.transactions.filter(
      tx => tx.farmerId === currentUser?.id && tx.status === 'pending'
    ).length;

    return {
      totalEarnings,
      totalTransactions,
      successfulPayments,
      pendingPayments,
      averageTransactionAmount: totalTransactions > 0 ? totalEarnings / totalTransactions : 0
    };
  };

  // Get payment validation status
  const getValidationStatus = (formData) => {
    const validations = {
      email: {
        isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || ''),
        message: 'Valid email address is required'
      },
      amount: {
        isValid: formData.amount > 0,
        message: 'Amount must be greater than 0'
      },
      terms: {
        isValid: formData.agreedToTerms === true,
        message: 'You must agree to the terms and conditions'
      }
    };

    const allValid = Object.values(validations).every(v => v.isValid);
    const errors = Object.entries(validations)
      .filter(([key, validation]) => !validation.isValid)
      .map(([key, validation]) => ({ field: key, message: validation.message }));

    return {
      isValid: allValid,
      errors,
      validations
    };
  };

  const value = {
    // State
    ...paymentState,
    
    // Actions
    setupFarmerPaymentAccount,
    verifyBankAccount,
    initializePayment,
    verifyPayment,
    processRefund,
    loadPaymentTransactions,
    getSupportedBanks,
    clearError,
    resetPaymentStatus,
    
    // Computed values
    getPaymentSummary,
    getValidationStatus
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

// Custom hook to use payment context
export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export default PaymentContext; 