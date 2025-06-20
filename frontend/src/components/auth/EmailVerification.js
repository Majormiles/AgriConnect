import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    success: false,
    message: '',
    error: false
  });

  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  // Verify email when component mounts if token is present
  useEffect(() => {
    if (token) {
      verifyEmailToken();
    }
  }, [token]);

  // Verify email token
  const verifyEmailToken = async () => {
    setIsVerifying(true);
    
    try {
      const result = await verifyEmail(token);
      
      setVerificationStatus({
        success: result.success,
        message: result.message,
        error: !result.success
      });

      // Redirect to dashboard after successful verification
      if (result.success) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      setVerificationStatus({
        success: false,
        message: 'An unexpected error occurred. Please try again.',
        error: true
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // If no token is provided
  if (!token) {
    return (
      <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Verification Link</h2>
          <p className="text-gray-600 mb-6">
            The verification link is missing or invalid. Please check your email for the correct verification link.
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary hover:bg-secondary text-white py-2 px-6 rounded-md transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        {isVerifying ? (
          <>
            <div className="mx-auto flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Your Email</h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </>
        ) : verificationStatus.success ? (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You will be redirected to your dashboard shortly.
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-primary hover:bg-secondary text-white py-2 px-6 rounded-md transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">
              {verificationStatus.message || 'The verification link is invalid or has expired. Please request a new verification email.'}
            </p>
            <div className="flex flex-col space-y-4">
              <Link
                to="/login"
                className="inline-block bg-primary hover:bg-secondary text-white py-2 px-6 rounded-md transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification; 