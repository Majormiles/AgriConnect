import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const EmailVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');
  const email = location.state?.email || '';
  const userType = location.state?.userType || 'user';
  const initialMessage = location.state?.message || '';

  useEffect(() => {
    // If there's a token in URL, automatically verify
    if (token) {
      handleVerification(token);
    } else if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [token, initialMessage]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerification = async (verificationToken) => {
    try {
      const result = await verifyEmail(verificationToken);
      
      if (result.success) {
        setVerificationStatus('success');
        setMessage(result.message || 'Email verified successfully!');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Email verified! You can now log in.' }
          });
        }, 3000);
      } else {
        setVerificationStatus('error');
        setMessage(result.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    if (!email || resendCooldown > 0) return;
    
    setIsResending(true);
    try {
      const result = await resendVerification(email);
      
      if (result.success) {
        setMessage('Verification email sent successfully! Please check your inbox.');
        setResendCooldown(60); // 60 seconds cooldown
      } else {
        setMessage(result.message || 'Failed to resend verification email.');
      }
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Email Verified Successfully!';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Check Your Email';
    }
  };

  const getStatusMessage = () => {
    if (message) return message;
    
    switch (verificationStatus) {
      case 'success':
        return 'Your email has been verified. You can now access all features of AgriConnect.';
      case 'error':
        return 'We couldn\'t verify your email. Please try again or contact support.';
      default:
        return `We've sent a verification email to ${email}. Please check your inbox and click the verification link.`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-600 p-3 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {getStatusIcon()}
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {getStatusTitle()}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {getStatusMessage()}
            </p>

            {/* Success Actions */}
            {verificationStatus === 'success' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-sm text-green-800">
                    🎉 Welcome to AgriConnect! You'll be redirected to login shortly.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors inline-block text-center"
                >
                  Continue to Login
                </Link>
              </div>
            )}

            {/* Pending/Error Actions */}
            {verificationStatus !== 'success' && (
              <div className="space-y-4">
                {email && (
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending || resendCooldown > 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isResending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      'Resend Verification Email'
                    )}
                  </button>
                )}

                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Not receiving emails?
              </h3>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Check your spam/junk folder</p>
                <p>• Make sure {email} is correct</p>
                <p>• Add noreply@agriconnect.com to your contacts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <Link to="/" className="hover:text-green-600 mr-4">Back to Home</Link>
          <span className="mx-2">•</span>
          {userType === 'farmer' ? (
            <Link to="/register-farmer" className="hover:text-green-600 mr-4">Register Again</Link>
          ) : (
            <Link to="/register" className="hover:text-green-600 mr-4">Register Again</Link>
          )}
          <span className="mx-2">•</span>
          <a href="/support" className="hover:text-green-600">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 