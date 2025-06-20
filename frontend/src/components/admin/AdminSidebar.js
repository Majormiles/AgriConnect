import React from 'react';
import { 
  HomeIcon,
  UsersIcon,
  CubeIcon,
  ShoppingCartIcon,
  TruckIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = ({ open, setOpen, activeModule, setActiveModule, admin }) => {
  const navigation = [
    {
      name: 'Dashboard',
      id: 'dashboard',
      icon: HomeIcon,
      description: 'System overview and key metrics'
    },
    {
      name: 'User Management',
      id: 'users',
      icon: UsersIcon,
      description: 'Manage farmers, buyers, and suppliers',
      submenu: [
        { name: 'All Users', id: 'users' },
        { name: 'Pending Verifications', id: 'user-verifications' },
        { name: 'User Analytics', id: 'user-analytics' }
      ]
    },
    {
      name: 'Product Management',
      id: 'products',
      icon: CubeIcon,
      description: 'Oversee product listings and approvals',
      submenu: [
        { name: 'All Products', id: 'products' },
        { name: 'Pending Approval', id: 'product-approvals' },
        { name: 'Product Categories', id: 'product-categories' }
      ]
    },
    {
      name: 'Order Management',
      id: 'orders',
      icon: ShoppingCartIcon,
      description: 'Monitor orders and transactions',
      submenu: [
        { name: 'All Orders', id: 'orders' },
        { name: 'Order Disputes', id: 'order-disputes' },
        { name: 'Payment Issues', id: 'payment-issues' }
      ]
    },
    {
      name: 'Logistics Control',
      id: 'logistics',
      icon: TruckIcon,
      description: 'Manage delivery and logistics providers',
      submenu: [
        { name: 'Logistics Providers', id: 'logistics-providers' },
        { name: 'Delivery Tracking', id: 'delivery-tracking' },
        { name: 'Route Optimization', id: 'route-optimization' }
      ]
    },
    {
      name: 'Analytics & Reports',
      id: 'analytics',
      icon: ChartBarIcon,
      description: 'Platform analytics and performance metrics',
      submenu: [
        { name: 'Platform Overview', id: 'analytics' },
        { name: 'User Engagement', id: 'user-engagement' },
        { name: 'Revenue Analytics', id: 'revenue-analytics' },
        { name: 'Market Trends', id: 'market-trends' }
      ]
    },
    {
      name: 'Content Moderation',
      id: 'moderation',
      icon: ExclamationTriangleIcon,
      description: 'Review and moderate platform content',
      submenu: [
        { name: 'Flagged Content', id: 'flagged-content' },
        { name: 'User Reports', id: 'user-reports' },
        { name: 'Moderation Queue', id: 'moderation-queue' }
      ]
    },
    {
      name: 'Communication Hub',
      id: 'communication',
      icon: ChatBubbleLeftRightIcon,
      description: 'Manage platform communications',
      submenu: [
        { name: 'Message Monitoring', id: 'message-monitoring' },
        { name: 'Announcements', id: 'announcements' },
        { name: 'Email Templates', id: 'email-templates' }
      ]
    },
    {
      name: 'System Reports',
      id: 'reports',
      icon: DocumentTextIcon,
      description: 'Generate and view system reports',
      submenu: [
        { name: 'Daily Reports', id: 'daily-reports' },
        { name: 'Monthly Reports', id: 'monthly-reports' },
        { name: 'Custom Reports', id: 'custom-reports' }
      ]
    },
    {
      name: 'Security Center',
      id: 'security',
      icon: ShieldCheckIcon,
      description: 'Platform security and compliance',
      submenu: [
        { name: 'Security Logs', id: 'security-logs' },
        { name: 'Failed Logins', id: 'failed-logins' },
        { name: 'Access Control', id: 'access-control' }
      ]
    },
    {
      name: 'System Settings',
      id: 'settings',
      icon: CogIcon,
      description: 'Configure platform settings',
      submenu: [
        { name: 'General Settings', id: 'settings' },
        { name: 'API Configuration', id: 'api-config' },
        { name: 'Admin Management', id: 'admin-management' }
      ]
    }
  ];

  const handleModuleClick = (moduleId) => {
    setActiveModule(moduleId);
    if (window.innerWidth < 1024) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo and Header */}
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="bg-green-600 rounded-lg p-2">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">AgriConnect</h1>
                <p className="text-sm text-gray-500">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Admin Info */}
          <div className="mt-6 px-4">
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center">
                <div className="bg-green-600 rounded-full p-1">
                  <ShieldCheckIcon className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-900 truncate">
                    {admin?.fullName}
                  </p>
                  <p className="text-xs text-green-700 capitalize">
                    {admin?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleModuleClick(item.id)}
                  className={`group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeModule === item.id
                      ? 'bg-green-100 text-green-900 border-r-2 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={item.description}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      activeModule === item.id ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </button>

                {/* Submenu - show if active */}
                {item.submenu && activeModule.startsWith(item.id) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleModuleClick(subItem.id)}
                        className={`group w-full flex items-center px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                          activeModule === subItem.id
                            ? 'bg-green-50 text-green-800'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
                        {subItem.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              AgriConnect Admin v1.0
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-0 flex z-40 ${open ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`} />

        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            {/* Mobile Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <div className="bg-green-600 rounded-lg p-2">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-bold text-gray-900">AgriConnect</h1>
                  <p className="text-xs text-gray-500">Admin Portal</p>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleModuleClick(item.id)}
                  className={`group w-full flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    activeModule === item.id
                      ? 'bg-green-100 text-green-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-4 h-6 w-6 ${
                      activeModule === item.id ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar; 