import React from 'react';
import { 
  UsersIcon,
  CubeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const DashboardOverview = ({ stats, onRefresh }) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Users',
      value: stats.stats.users.total,
      icon: UsersIcon,
      color: 'blue',
      subtitle: `${stats.stats.users.farmers} farmers, ${stats.stats.users.buyers} buyers`,
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Pending Verifications',
      value: stats.stats.users.pendingVerification,
      icon: ExclamationTriangleIcon,
      color: 'yellow',
      subtitle: 'Farmers awaiting approval',
      urgent: stats.stats.users.pendingVerification > 10
    },
    {
      title: 'Total Products',
      value: stats.stats.products.total,
      icon: CubeIcon,
      color: 'green',
      subtitle: `${stats.stats.products.pending} pending approval`,
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Total Orders',
      value: stats.stats.orders.total,
      icon: ShoppingCartIcon,
      color: 'purple',
      subtitle: `${stats.stats.orders.pending} pending, ${stats.stats.orders.completed} completed`,
      trend: { value: 15, isPositive: true }
    },
    {
      title: 'Total Revenue',
      value: `₵${(stats.stats.revenue.total / 100).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'emerald',
      subtitle: 'From completed orders',
      trend: { value: 23, isPositive: true }
    }
  ];

  const getColorClasses = (color, variant = 'bg') => {
    const colors = {
      blue: variant === 'bg' ? 'bg-blue-500' : 'text-blue-600',
      yellow: variant === 'bg' ? 'bg-yellow-500' : 'text-yellow-600',
      green: variant === 'bg' ? 'bg-green-500' : 'text-green-600',
      purple: variant === 'bg' ? 'bg-purple-500' : 'text-purple-600',
      emerald: variant === 'bg' ? 'bg-emerald-500' : 'text-emerald-600'
    };
    return colors[color] || colors.blue;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVerificationStatus = (verification) => {
    switch (verification?.status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Verified</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Unverified</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600">Monitor your AgriConnect platform performance</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {metricCards.map((metric) => (
          <div
            key={metric.title}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
              metric.urgent ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${getColorClasses(metric.color)}`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              {metric.trend && (
                <div className={`flex items-center text-sm ${
                  metric.trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend.isPositive ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {metric.trend.value}%
                </div>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{metric.title}</p>
              <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentActivities.users.map((user) => (
                <div key={user._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <UsersIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getVerificationStatus(user.verification)}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentActivities.orders.map((order) => (
                <div key={order._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <ShoppingCartIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.buyer?.firstName} {order.buyer?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className="ml-1 text-sm capitalize text-gray-700">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ₵{(order.totalAmount / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Products</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentActivities.products.map((product) => (
                <div key={product._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <CubeIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.farmer?.firstName} {product.farmer?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      {getStatusIcon(product.status)}
                      <span className="ml-1 text-sm capitalize text-gray-700">
                        {product.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ₵{product.price?.value?.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Review Pending</span>
            <span className="text-xs text-gray-500">
              {stats.stats.users.pendingVerification + stats.stats.products.pending} items
            </span>
          </button>

          <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors">
            <UsersIcon className="h-8 w-8 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
            <span className="text-xs text-gray-500">{stats.stats.users.total} total</span>
          </button>

          <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors">
            <CubeIcon className="h-8 w-8 text-green-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">View Products</span>
            <span className="text-xs text-gray-500">{stats.stats.products.total} listed</span>
          </button>

          <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors">
            <ShoppingCartIcon className="h-8 w-8 text-purple-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Monitor Orders</span>
            <span className="text-xs text-gray-500">{stats.stats.orders.total} orders</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 