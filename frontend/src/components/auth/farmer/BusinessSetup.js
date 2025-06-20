import React, { useState } from 'react';

const PAYMENT_METHODS = [
  {
    type: 'mobile_money',
    name: 'Mobile Money',
    providers: [
      'MTN Mobile Money',
      'Vodafone Cash',
      'AirtelTigo Money'
    ]
  },
  {
    type: 'bank',
    name: 'Bank Transfer',
    providers: [
      'Ghana Commercial Bank',
      'Ecobank',
      'Agricultural Development Bank',
      'Fidelity Bank',
      'Cal Bank'
    ]
  }
];

const TRANSPORTATION_OPTIONS = [
  'Own Vehicle',
  'Third-party Logistics',
  'Pickup Service',
  'Local Transport Union',
  'No Transportation Available'
];

const MARKET_REACH = [
  'Local Market',
  'Regional Market',
  'National Market',
  'Export Market',
  'Direct to Consumers',
  'Wholesale',
  'Retail'
];

const BusinessSetup = ({ formData, onChange, errors }) => {
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState(
    formData.businessProfile.paymentMethods || []
  );
  const [selectedMarketReach, setSelectedMarketReach] = useState(
    formData.businessProfile.marketReach || []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(4, {
      businessProfile: {
        ...formData.businessProfile,
        [name]: value
      }
    });
  };

  const handlePaymentMethodToggle = (method) => {
    const updatedMethods = selectedPaymentMethods.includes(method)
      ? selectedPaymentMethods.filter(m => m !== method)
      : [...selectedPaymentMethods, method];
    
    setSelectedPaymentMethods(updatedMethods);
    onChange(4, {
      businessProfile: {
        ...formData.businessProfile,
        paymentMethods: updatedMethods
      }
    });
  };

  const handleMarketReachToggle = (market) => {
    const updatedMarkets = selectedMarketReach.includes(market)
      ? selectedMarketReach.filter(m => m !== market)
      : [...selectedMarketReach, market];
    
    setSelectedMarketReach(updatedMarkets);
    onChange(4, {
      businessProfile: {
        ...formData.businessProfile,
        marketReach: updatedMarkets
      }
    });
  };

  const handleProviderAccountAdd = (type, provider) => {
    const accountDetail = {
      provider,
      accountNumber: '',
      accountName: ''
    };

    onChange(4, {
      businessProfile: {
        ...formData.businessProfile,
        accountDetails: {
          ...formData.businessProfile.accountDetails,
          [type]: [
            ...(formData.businessProfile.accountDetails[type] || []),
            accountDetail
          ]
        }
      }
    });
  };

  const handleAccountDetailChange = (type, index, field, value) => {
    const updatedAccounts = [...(formData.businessProfile.accountDetails[type] || [])];
    updatedAccounts[index] = {
      ...updatedAccounts[index],
      [field]: value
    };

    onChange(4, {
      businessProfile: {
        ...formData.businessProfile,
        accountDetails: {
          ...formData.businessProfile.accountDetails,
          [type]: updatedAccounts
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Methods
        </label>
        {PAYMENT_METHODS.map(methodGroup => (
          <div key={methodGroup.type} className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {methodGroup.name}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {methodGroup.providers.map(provider => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => handlePaymentMethodToggle(provider)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedPaymentMethods.includes(provider)
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
            {selectedPaymentMethods.includes(methodGroup.name) && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => handleProviderAccountAdd(methodGroup.type, methodGroup.name)}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  + Add {methodGroup.name} Account
                </button>
                {formData.businessProfile.accountDetails[methodGroup.type]?.map((account, index) => (
                  <div key={index} className="mt-2 p-3 bg-gray-50 rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Account Number"
                        value={account.accountNumber}
                        onChange={(e) => handleAccountDetailChange(
                          methodGroup.type,
                          index,
                          'accountNumber',
                          e.target.value
                        )}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Account Name"
                        value={account.accountName}
                        onChange={(e) => handleAccountDetailChange(
                          methodGroup.type,
                          index,
                          'accountName',
                          e.target.value
                        )}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {errors.paymentMethods && (
          <p className="mt-2 text-sm text-red-600">{errors.paymentMethods}</p>
        )}
      </div>

      <div>
        <label htmlFor="transportationCapabilities" className="block text-sm font-medium text-gray-700">
          Transportation Capabilities
        </label>
        <div className="mt-1">
          <select
            id="transportationCapabilities"
            name="transportationCapabilities"
            value={formData.businessProfile.transportationCapabilities}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option value="">Select transportation option</option>
            {TRANSPORTATION_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="storageAvailable" className="block text-sm font-medium text-gray-700">
          Storage Facility Available
        </label>
        <div className="mt-1">
          <select
            id="storageAvailable"
            name="storageAvailable"
            value={formData.businessProfile.storageAvailable}
            onChange={(e) => handleChange({
              target: {
                name: 'storageAvailable',
                value: e.target.value === 'true'
              }
            })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Market Reach
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MARKET_REACH.map(market => (
            <button
              key={market}
              type="button"
              onClick={() => handleMarketReachToggle(market)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedMarketReach.includes(market)
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {market}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessSetup; 