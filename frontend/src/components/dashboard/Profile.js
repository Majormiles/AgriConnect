import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { profile, updateProfile, loading, error } = useDashboard();
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || profile?.firstName || '',
    lastName: currentUser?.lastName || profile?.lastName || '',
    phoneNumber: currentUser?.phoneNumber || profile?.phoneNumber || '',
    language: currentUser?.language || profile?.language || 'en'
  });

  useEffect(() => {
    // Update form data when user data becomes available
    if (currentUser || profile) {
      setFormData({
        firstName: currentUser?.firstName || profile?.firstName || '',
        lastName: currentUser?.lastName || profile?.lastName || '',
        phoneNumber: currentUser?.phoneNumber || profile?.phoneNumber || '',
        language: currentUser?.language || profile?.language || 'en'
      });
    }
  }, [currentUser, profile]);

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phoneNumber);
  };

  const formatPhoneNumber = (phoneNumber) => {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If number starts with 233, replace it with 0
    if (cleaned.startsWith('233')) {
      cleaned = '0' + cleaned.slice(3);
    }
    
    // If number starts with +233, replace it with 0
    if (cleaned.startsWith('233')) {
      cleaned = '0' + cleaned.slice(3);
    }
    
    // If number doesn't start with 0, add it
    if (!cleaned.startsWith('0')) {
      cleaned = '0' + cleaned;
    }
    
    // Limit to 10 digits (0 + 9 digits)
    cleaned = cleaned.slice(0, 10);
    
    return cleaned;
  };

  const handlePhoneNumberChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phoneNumber: formatted });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate phone number
    if (!validatePhoneNumber(formData.phoneNumber)) {
      setFormError('Please enter a valid phone number (0 followed by 9 digits)');
      return;
    }

    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setFormError(error.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: currentUser?.firstName || profile?.firstName || '',
      lastName: currentUser?.lastName || profile?.lastName || '',
      phoneNumber: currentUser?.phoneNumber || profile?.phoneNumber || '',
      language: currentUser?.language || profile?.language || 'en'
    });
    setFormError('');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  // Combine data from both contexts, preferring profile data over currentUser
  const userData = { ...currentUser, ...profile };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Edit Profile
            </button>
          )}
        </div>

        {formError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {formError}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder="0XX..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Format: 0XXXXXXXXX (10 digits total)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="en">English</option>
                  <option value="tw">Twi</option>
                  <option value="ha">Hausa</option>
                  <option value="ga">Ga</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
              <p className="mt-1 text-lg text-gray-900">
                {userData.firstName} {userData.lastName}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-lg text-gray-900">{userData.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
              <p className="mt-1 text-lg text-gray-900">{userData.phoneNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Preferred Language</h3>
              <p className="mt-1 text-lg text-gray-900">
                {userData.language === 'en' && 'English'}
                {userData.language === 'tw' && 'Twi'}
                {userData.language === 'ha' && 'Hausa'}
                {userData.language === 'ga' && 'Ga'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Account Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Activity</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">Last Login</p>
              <p className="text-sm text-gray-500">
                {userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">Account Status</p>
              <p className="text-sm text-gray-500">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {userData.status ? userData.status.charAt(0).toUpperCase() + userData.status.slice(1) : 'Active'}
                </span>
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Member Since</p>
              <p className="text-sm text-gray-500">
                {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 