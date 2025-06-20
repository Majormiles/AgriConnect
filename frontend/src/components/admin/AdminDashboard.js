import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import AdminSidebar from './AdminSidebar';
import DashboardOverview from './DashboardOverview';
import UserManagement from './UserManagement';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import Analytics from './Analytics';
import SystemSettings from './SystemSettings';
import { 
  Bars3Icon, 
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const { admin, logout, getDashboardStats } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    loadDashboardData();
  }, [admin, navigate]);

  const loadDashboardData = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const renderActiveModule = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
        </div>
      );
    }

    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview stats={stats} onRefresh={loadDashboardData} />;
      case 'users':
        return <UserManagement />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <DashboardOverview stats={stats} onRefresh={loadDashboardData} />;
    }
  };

  const getModuleTitle = () => {
    const titles = {
      dashboard: 'Dashboard Overview',
      users: 'User Management',
      products: 'Product Management',
      orders: 'Order Management',
      analytics: 'Analytics & Reports',
      settings: 'System Settings'
    };
    return titles[activeModule] || 'Dashboard';
  };

  if (!admin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        admin={admin}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-72 min-w-0">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 w-full">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="ml-4 text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                {getModuleTitle()}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

              {/* Admin profile dropdown */}
              <div className="relative">
                <button
                  className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <div className="hidden lg:flex lg:flex-col lg:items-start">
                    <span className="text-gray-900 font-medium">{admin.fullName}</span>
                    <span className="text-gray-500 text-xs capitalize">{admin.role.replace('_', ' ')}</span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500">
                        <div className="font-medium text-gray-900">{admin.fullName}</div>
                        <div className="text-xs">{admin.email}</div>
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => setActiveModule('profile')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Profile Settings
                      </button>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      {/* Mobile overlay is handled in AdminSidebar component */}
    </div>
  );
};

export default AdminDashboard; 