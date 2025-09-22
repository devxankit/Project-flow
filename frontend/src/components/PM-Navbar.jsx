import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Building2, 
  CheckSquare, 
  Activity, 
  BarChart3, 
  User,
  MessageSquare,
  LogOut
} from 'lucide-react';

const PMNavbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

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
    { name: 'Dashboard', icon: BarChart3, href: '/pm-dashboard', key: 'dashboard' },
    { name: 'Customers', icon: Building2, href: '/customers', key: 'customers' },
    { name: 'Tasks', icon: CheckSquare, href: '/tasks', key: 'tasks' },
    { name: 'Requests', icon: MessageSquare, href: '/task-requests', key: 'requests' },
    { name: 'Activity', icon: Activity, href: '/activity', key: 'activity' },
  ];

  const handleNavigation = (href) => {
    navigate(href);
  };

  const handleLogout = () => {
    toast.success('Logged Out', 'You have been successfully logged out.');
    logout();
  };


  // Desktop Navbar
  const DesktopNavbar = () => (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-3">
              <img 
                src="/images/logo.png" 
                alt="RS Management Logo" 
                className="h-10 w-auto"
              />
              <span className="text-base font-semibold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent hidden sm:block">
                RS Management
              </span>
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

          {/* Logout & Profile */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:block text-sm font-medium">Logout</span>
            </button>
            <div className="relative">
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                {user?.profileImage?.url ? (
                  <img 
                    src={user.profileImage.url} 
                    alt={user.fullName || 'User'} 
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </span>
                  </div>
                )}
                <span className="hidden lg:block text-sm font-medium">{user?.fullName || 'User'}</span>
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
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img 
            src="/images/logo.png" 
            alt="RS Management Logo" 
            className="h-8 w-auto"
          />
          <span className="text-sm font-semibold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
            RS Management
          </span>
        </div>

        {/* Logout & Profile */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200 overflow-hidden"
          >
            {user?.profileImage?.url ? (
              <img 
                src={user.profileImage.url} 
                alt={user.fullName || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile Bottom Navbar
  const MobileBottomNavbar = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 mobile-bottom-navbar bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg safe-area-pb">
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

export default PMNavbar;
