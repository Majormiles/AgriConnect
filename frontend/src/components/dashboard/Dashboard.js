import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Profile from './Profile';
import FarmDashboard from './FarmDashboard';
import Notifications from './Notifications';
import Settings from './Settings';
import Support from './Support';
import MarketDashboard from '../market/MarketDashboard';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  const { loading, error } = useDashboard();

  // Add debugging logs
  console.log('Dashboard - Current User:', currentUser);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024); // 1024px is the lg breakpoint
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <Profile />;
      case 'farm':
        return currentUser?.role === 'farmer' ? <FarmDashboard /> : null;
      case 'market':
        return <MarketDashboard />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      case 'support':
        return <Support />;
      default:
        return <Profile />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Add debugging log for role being passed to Sidebar
  console.log('Dashboard - Role being passed to Sidebar:', currentUser.role);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white transform 
        lg:relative lg:translate-x-0 lg:z-0
        transition duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={(section) => {
            setActiveSection(section);
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
          userRole={currentUser.role}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 