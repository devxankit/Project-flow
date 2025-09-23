import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeNavbar from '../components/Employee-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { Building2, CheckSquare, Clock, TrendingUp, Users, Calendar, AlertTriangle, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { customerApi, handleApiError } from '../utils/api';

const EmployeeCustomers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Scroll to top when component mounts
  useScrollToTop();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);

  // Fetch customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await customerApi.getCustomers();
        
        if (response.success) {
          // Backend returns { data: { customers: [...], pagination: {...} } }
          setCustomers(response.data?.customers || []);
        } else {
          toast.error('Error', 'Failed to load customers');
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        handleApiError(error, toast);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-primary/10 text-primary border-primary/20';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <EmployeeNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading customers...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <EmployeeNavbar />
      
      {/* Main Content */}
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="mb-4 md:mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  Assigned Customers
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  View and manage your assigned customer relationships
                </p>
              </div>
            </div>
          </div>

          {/* Customer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {customers.length > 0 ? (
              customers.map((customer) => {
                const daysUntilDue = getDaysUntilDue(customer.dueDate);
                const isOverdue = daysUntilDue < 0;
                const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

                return (
                  <div
                    key={customer._id}
                    onClick={() => navigate(`/employee-customer-details/${customer._id}`)}
                    className="group bg-white rounded-2xl md:rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(customer.priority)}`}>
                          {customer.priority}
                        </span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {customer.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {customer.description || 'No description provided'}
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {Math.round(customer.progress || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round(customer.progress || 0)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{customer.assignedTeam?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(customer.dueDate)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isOverdue && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {isDueSoon && !isOverdue && (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        <Eye className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                    </div>

                    {/* Due Date Warning */}
                    {(isOverdue || isDueSoon) && (
                      <div className={`mt-3 p-2 rounded-lg text-xs font-medium ${
                        isOverdue 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {isOverdue 
                          ? `${Math.abs(daysUntilDue)} days overdue`
                          : `${daysUntilDue} days until due`
                        }
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers assigned</h3>
                <p className="text-gray-600 mb-6">
                  You haven't been assigned to any customers yet. Contact your project manager for assignments.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeCustomers;
