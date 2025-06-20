import React from 'react';
import { useDashboard } from '../../context/DashboardContext';

const Settings = () => {
  const { preferences, updatePreferences, loading, error } = useDashboard();

  const handleThemeChange = async (theme) => {
    try {
      await updatePreferences({ ...preferences, theme });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const handleNotificationToggle = async (type) => {
    try {
      await updatePreferences({
        ...preferences,
        notifications: {
          ...preferences.notifications,
          [type]: !preferences.notifications[type]
        }
      });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
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

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Appearance</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Theme</label>
            <div className="mt-2 space-x-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`inline-flex items-center px-4 py-2 rounded-md ${
                  preferences?.theme === 'light'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`inline-flex items-center px-4 py-2 rounded-md ${
                  preferences?.theme === 'dark'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-green-600"
                checked={preferences?.notifications?.email}
                onChange={() => handleNotificationToggle('email')}
              />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-500">Receive notifications via SMS</p>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-green-600"
                checked={preferences?.notifications?.sms}
                onChange={() => handleNotificationToggle('sms')}
              />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Order Updates</p>
              <p className="text-sm text-gray-500">Get notified about order status changes</p>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-green-600"
                checked={preferences?.notifications?.orderUpdates}
                onChange={() => handleNotificationToggle('orderUpdates')}
              />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Market Price Updates</p>
              <p className="text-sm text-gray-500">Get notified about market price changes</p>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-green-600"
                checked={preferences?.notifications?.marketPrices}
                onChange={() => handleNotificationToggle('marketPrices')}
              />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Weather Alerts</p>
              <p className="text-sm text-gray-500">Get notified about important weather updates</p>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-green-600"
                checked={preferences?.notifications?.weatherAlerts}
                onChange={() => handleNotificationToggle('weatherAlerts')}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Privacy</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Profile Visibility</p>
              <p className="text-sm text-gray-500">Control who can see your profile information</p>
            </div>
            <select className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
              <option>Public</option>
              <option>Private</option>
              <option>Verified Users Only</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Location Sharing</p>
              <p className="text-sm text-gray-500">Share your farm location with buyers</p>
            </div>
            <select className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
              <option>Enabled</option>
              <option>Disabled</option>
              <option>Verified Buyers Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Security</h2>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Change Password</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 