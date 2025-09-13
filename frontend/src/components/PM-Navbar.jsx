import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './magicui/button';
import { Dock, DockIcon } from './magicui/dock';
import { 
  Home, 
  FolderKanban, 
  CheckSquare, 
  Activity, 
  BarChart3, 
  User,
  Menu,
  X
} from 'lucide-react';

const PMNavbar = ({ currentPage = 'Dashboard' }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    { name: 'Home', icon: Home, href: '/pm-dashboard', key: 'home' },
    { name: 'Projects', icon: FolderKanban, href: '/projects', key: 'projects' },
    { name: 'Tasks', icon: CheckSquare, href: '/tasks', key: 'tasks' },
    { name: 'Activity', icon: Activity, href: '/activity', key: 'activity' },
    { name: 'Dashboard', icon: BarChart3, href: '/dashboard', key: 'dashboard' },
  ];

  const handleNavigation = (href) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  // Get current page from location
  const getCurrentPage = () => {
    const path = location.pathname;
    const item = navigationItems.find(item => item.href === path);
    return item ? item.name : 'Dashboard';
  };

  // Desktop Navbar
  const DesktopNavbar = () => (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PM</span>
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

          {/* Profile */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden lg:block text-sm font-medium">John Doe</span>
              </button>
            </div>
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
          <h1 className="text-lg font-semibold text-gray-900">{getCurrentPage()}</h1>
        </div>

        {/* Profile */}
        <div className="flex items-center space-x-3">
          <button className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 hover:text-gray-900"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-40">
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
      )}
    </div>
  );

  // Mobile Bottom Dock
  const MobileBottomDock = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4">
      <Dock className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg">
        {navigationItems.map((item) => (
          <DockIcon
            key={item.key}
            onClick={() => handleNavigation(item.href)}
            className={`transition-colors ${
              location.pathname === item.href
                ? 'bg-primary/20 text-primary'
                : 'hover:bg-gray-100'
            }`}
          >
            <item.icon className={`h-5 w-5 ${
              location.pathname === item.href
                ? 'text-primary'
                : 'text-gray-600'
            }`} />
          </DockIcon>
        ))}
      </Dock>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <>
          <MobileTopBar />
          <MobileBottomDock />
        </>
      ) : (
        <DesktopNavbar />
      )}
    </>
  );
};

export default PMNavbar;
