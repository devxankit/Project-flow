import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();


  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      // Clear old localStorage data if it has the wrong structure
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (!userData.role || !userData.fullName) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setIsLoading(false);
            return;
          }
        } catch (error) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setIsLoading(false);
          return;
        }
      }
      
      if (savedUser && savedToken) {
        try {
          const userData = JSON.parse(savedUser);
          
          // Fix user data structure to match expected format
          const fixedUserData = {
            ...userData,
            fullName: userData.fullName || userData.name || 'Unknown User',
            role: userData.role || 'pm', // Default to pm if no role
            avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName || userData.name || 'U')}&background=0ea5e9&color=fff&size=128`
          };
          
          // Validate token with backend
          const isValidToken = await validateToken(savedToken);
          
          if (isValidToken) {
            setUser(fixedUserData);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Validate token with backend
  const validateToken = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.success;
      } else {
        return false;
      }
    } catch (error) {
      console.log('Token validation failed');
      return false;
    }
  };

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    
    try {
      // Make API call to backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Extract token and user data from response
        const { token, user } = data;
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        // Navigate to appropriate dashboard
        setTimeout(() => {
          const dashboardRoute = user.role === 'pm' ? '/pm-dashboard' :
                                user.role === 'employee' ? '/employee-dashboard' :
                                user.role === 'customer' ? '/customer-dashboard' : '/';
          navigate(dashboardRoute);
        }, 1000);
        
        return { success: true, user, token };
      } else {
        // Handle different error types
        if (data.error === 'Invalid credentials') {
          return { success: false, error: 'unknown_user' };
        } else if (data.error === 'Account is inactive') {
          return { success: false, error: 'Account is inactive' };
        } else {
          return { success: false, error: data.error || 'Login failed. Please try again.' };
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please check your connection.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Call backend logout endpoint if token exists
      if (token) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.log('Logout API call failed, proceeding with local logout');
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/');
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return false;
      }

      const response = await fetch('http://localhost:5000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          localStorage.setItem('token', data.token);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.log('Token refresh failed');
      return false;
    }
  };

  // Update user data
  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  // Check if user has specific role
  const hasRole = (role) => {
    const userRole = user?.role || 'pm'; // Default to pm if no role
    return user && userRole === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    const userRole = user?.role || 'pm'; // Default to pm if no role
    return user && roles.includes(userRole);
  };

  // Get user's dashboard route based on role
  const getDashboardRoute = () => {
    if (!user) return '/';
    
    const userRole = user.role || 'pm'; // Default to pm if no role
    switch (userRole) {
      case 'pm':
        return '/pm-dashboard';
      case 'employee':
        return '/employee-dashboard';
      case 'customer':
        return '/customer-dashboard';
      default:
        return '/pm-dashboard';
    }
  };

  // Redirect to appropriate dashboard
  const redirectToDashboard = () => {
    const dashboardRoute = getDashboardRoute();
    navigate(dashboardRoute);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    validateToken,
    updateUser,
    hasRole,
    hasAnyRole,
    getDashboardRoute,
    redirectToDashboard
  };

  try {
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  } catch (error) {
    console.error('AuthProvider error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600">There was an error initializing the authentication system.</p>
          <p className="text-sm text-gray-500 mt-2">Error: {error.message}</p>
        </div>
      </div>
    );
  }
};
