import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FolderKanban, 
  CheckSquare, 
  Activity, 
  BarChart3, 
  User,
  FileText
} from 'lucide-react';

const CustomerNavbar = ({ currentPage = 'Dashboard' }) => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navigationItems = [
    { name: 'My Projects', icon: FolderKanban, href: '/customer-dashboard', key: 'dashboard' },
    { name: 'Activity', icon: Activity, href: '/customer-activity', key: 'activity' },
    { name: 'Files', icon: FileText, href: '/customer-files', key: 'files' },
    { name: 'Profile', icon: User, href: '/customer-profile', key: 'profile' },
  ];

  const handleNavigation = (href) => {
    navigate(href);
  };

  // Get current page from location with smooth transitions
  const getCurrentPage = () => {
    const path = location.pathname;
    const item = navigationItems.find(item => item.href === path);
    return item ? item.name : 'My Projects';
  };

  // Memoize current page to prevent unnecessary re-renders
  const currentPageName = React.useMemo(() => getCurrentPage(), [location.pathname]);

  // Desktop Navbar
  const DesktopNavbar = () => (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">TaskFlow</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.href)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                    location.pathname === item.href
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Logo/Title */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="hidden lg:block text-sm font-medium text-gray-700">Customer</span>
          </div>
        </div>
      </div>
    </nav>
  );

  // Mobile Top Bar
  const MobileTopBar = () => (
    <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="flex justify-between items-center h-14 px-4">
        {/* Current Page Title */}
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-900 page-title">
            {currentPageName}
          </h1>
        </div>

        {/* Logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Bottom Navbar
  const MobileBottomNavbar = () => (
    <div className="md:hidden mobile-bottom-navbar bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleNavigation(item.href)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 active:scale-95 ${
              location.pathname === item.href
                ? 'text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-200 ${
              location.pathname === item.href
                ? 'bg-primary/10 scale-110 shadow-sm'
                : 'hover:bg-gray-100'
            }`}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className={`text-xs font-medium mt-1 transition-colors ${
              location.pathname === item.href
                ? 'text-primary'
                : 'text-gray-500'
            }`}>
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <>
          <MobileTopBar />
          <MobileBottomNavbar />
        </>
      ) : (
        <DesktopNavbar />
      )}
    </>
  );
};

export default CustomerNavbar;
