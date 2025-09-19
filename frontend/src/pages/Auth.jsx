import React, { useState } from 'react';
import { ShinyButton } from '../components/magicui/shiny-button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/magicui/card';
import { Input } from '../components/magicui/input';
import { Button } from '../components/magicui/button';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const Auth = () => {
  const { toast } = useToast();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          toast.success(
            'Login Successful!', 
            `Welcome back, ${result.user.fullName}!`
          );
          
          // The AuthContext will handle navigation automatically
        } else {
          // Handle unknown user case with specific toast
          if (result.error === 'unknown_user') {
            toast.warning(
              'Account Not Found',
              'Don\'t have an account? Contact your Project Manager to get access.'
            );
          } else {
            toast.error(
              'Login Failed', 
              result.error || 'Invalid email or password. Please check your credentials.'
            );
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        toast.error(
          'Login Error', 
          'Something went wrong. Please try again.'
        );
      }
    } else {
      toast.error(
        'Validation Error', 
        'Please fix the errors in the form before submitting.'
      );
    }
  };


  try {
    return (
      <div className="min-h-screen bg-background">
        {/* Auth Navbar */}
        <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-start items-center h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/images/logo.png" 
                    alt="RS Management Logo" 
                    className="h-10 w-auto"
                  />
                  <span className="text-base font-semibold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
                    RS Management
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Auth Form */}
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="w-full max-w-sm">
          <Card className="shadow-lg">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-2xl font-semibold text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6">
              <div className="grid gap-4">
                {/* Email Field */}
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="grid gap-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password}</p>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t border-border/50 flex flex-col gap-4">
              <ShinyButton
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </ShinyButton>
            
              {/* Information */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Enter your credentials to access the platform
                </p>
              </div>
            </CardFooter>
          </form>
          </Card>
        </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Auth component error:', error);
    return (
      <div className="min-h-screen bg-background">
        {/* Auth Navbar */}
        <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-start items-center h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/images/logo.png" 
                    alt="RS Management Logo" 
                    className="h-10 w-auto"
                  />
                  <span className="text-base font-semibold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
                    RS Management
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Error Content */}
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Auth Component Error</h1>
            <p className="text-gray-600">There was an error loading the authentication page.</p>
            <p className="text-sm text-gray-500 mt-2">Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }
};

export default Auth;
