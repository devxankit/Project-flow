import React, { useState } from 'react';
import { Button } from './magicui/button';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleProducts = () => {
    setIsProductsOpen(!isProductsOpen);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PM</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">TaskFlow</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <div className="relative">
                <button
                  onClick={toggleProducts}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                >
                  Features
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {isProductsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Task Management</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Team Collaboration</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Project Tracking</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Time Tracking</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Analytics & Reports</a>
                  </div>
                )}
              </div>
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Templates
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Pricing
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Help Center
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </a>
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="text-gray-700 hover:text-gray-900"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              Features
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              Templates
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              Help Center
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              About
            </a>
            <div className="pt-4 pb-3 border-t border-gray-100">
              <div className="flex flex-col space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  Sign In
                </Button>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
