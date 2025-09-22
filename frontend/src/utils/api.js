// API utility functions for user management
// Build timestamp: 2025-09-19T12:45:00Z - Force Vercel rebuild

// Determine the correct API URL based on environment
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const isVercel = hostname.includes('vercel.app');
  const isProduction = import.meta.env.PROD;
  
  console.log('🔍 Environment check:', {
    hostname,
    isVercel,
    isProduction,
    mode: import.meta.env.MODE,
    viteApiUrl: import.meta.env.VITE_API_URL
  });
  
  // If environment variable is set, use it
  if (import.meta.env.VITE_API_URL) {
    console.log('✅ Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // If we're on Vercel (production), ALWAYS use Render backend
  if (isVercel || isProduction) {
    const renderUrl = 'https://project-flow-hyas.onrender.com/api';
    console.log('✅ Using Render backend for production:', renderUrl);
    return renderUrl;
  }
  
  // For local development, use localhost
  const localhostUrl = 'http://localhost:5000/api';
  console.log('✅ Using localhost for development:', localhostUrl);
  return localhostUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Log the final API URL for debugging
console.log('🌐 FINAL API Base URL:', API_BASE_URL);
console.log('🚀 Build timestamp: 2025-09-19T12:45:00Z');

// Simple request throttling to prevent 429 errors
const requestQueue = new Map();
const REQUEST_DELAY = 100; // 100ms delay between requests

const throttleRequest = async (key, requestFn) => {
  if (requestQueue.has(key)) {
    // If request is already in progress, wait for it
    return requestQueue.get(key);
  }
  
  const promise = new Promise(async (resolve, reject) => {
    try {
      // Add small delay to prevent rapid requests
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      // Remove from queue after completion
      requestQueue.delete(key);
    }
  });
  
  requestQueue.set(key, promise);
  return promise;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Only add Authorization header if token exists and is not null/undefined
  if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  // Handle 429 (Too Many Requests) without trying to parse JSON
  if (response.status === 429) {
    throw new Error('Too many requests. Please wait a moment and try again.');
  }
  
  // Get response text first to handle non-JSON responses
  const responseText = await response.text();
  
  // Try to parse as JSON, but handle cases where response is not valid JSON
  let data;
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch (parseError) {
    console.error('Failed to parse response as JSON:', responseText);
    // If response is not valid JSON, create a generic error object
    data = {
      message: responseText || 'Invalid response from server',
      error: 'Invalid JSON response'
    };
  }
  
  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      // Only redirect if this is NOT a login attempt
      // Login attempts should not redirect, they should show error messages
      if (!response.url.includes('/auth/login')) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Authentication failed. Please login again.');
      }
    }
    
    // Handle validation errors (400 Bad Request)
    if (response.status === 400) {
      const errorMessage = data.message || data.error || 'Bad request. Please check your input.';
      throw new Error(errorMessage);
    }
    
    throw new Error(data.message || data.error || 'API request failed');
  }
  
  return data;
};

// User Management API functions
export const userApi = {
  // Get all users with pagination and filters
  getAllUsers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const url = `${API_BASE_URL}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get single user by ID
  getUserById: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Create new user
  createUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    
    return handleApiResponse(response);
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    
    return handleApiResponse(response);
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Reset user password
  resetUserPassword: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Export user credentials
  exportUserCredentials: async () => {
    const response = await fetch(`${API_BASE_URL}/users/export/credentials`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  }
};

// Generic API error handler
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return defaultMessage;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to get auth headers for file uploads
const getAuthHeadersForUpload = () => {
  const token = localStorage.getItem('token');
  const headers = {};
  
  // Only add Authorization header if token exists and is not null/undefined
  if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Project Management API functions
// Customer API functions (replaces projectApi)
export const customerApi = {
  // Get all customers with pagination and filters
  getCustomers: async (params = {}) => {
    const queryKey = `customers-${JSON.stringify(params)}`;
    return throttleRequest(queryKey, async () => {
      const queryParams = new URLSearchParams();
      
      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const url = `${API_BASE_URL}/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleApiResponse(response);
    });
  },

  // Get single customer by ID
  getCustomerById: async (customerId) => {
    return throttleRequest(`customer-${customerId}`, async () => {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleApiResponse(response);
    });
  },

  // Create new customer
  createCustomer: async (customerData) => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(customerData)
    });
    
    return handleApiResponse(response);
  },

  // Update customer
  updateCustomer: async (customerId, customerData) => {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(customerData)
    });
    
    return handleApiResponse(response);
  },

  // Delete customer
  deleteCustomer: async (customerId) => {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get customer statistics
  getCustomerStats: async () => {
    const response = await fetch(`${API_BASE_URL}/customers/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get users for customer assignment
  getUsersForCustomer: async (type = null) => {
    const url = type ? `${API_BASE_URL}/customers/users?type=${type}` : `${API_BASE_URL}/customers/users`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get all tasks for a customer
  getCustomerTasks: async (customerId) => {
    return throttleRequest(`customer-tasks-${customerId}`, async () => {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}/tasks`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleApiResponse(response);
    });
  }
};

// Note: projectApi removed - replaced with customerApi

// Task API functions (updated for customer structure)
export const taskApi = {
  // Create a new task
  createTask: async (taskData) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: taskData // FormData for file uploads
    });
    
    return handleApiResponse(response);
  },

  // Get tasks for a customer
  getTasksByCustomer: async (customerId) => {
    return throttleRequest(`tasks-customer-${customerId}`, async () => {
      const response = await fetch(`${API_BASE_URL}/tasks/customer/${customerId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleApiResponse(response);
    });
  },

  // Get single task
  getTask: async (taskId, customerId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/customer/${customerId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Update task
  updateTask: async (taskId, customerId, taskData) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/customer/${customerId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: taskData // FormData for file uploads
    });
    
    return handleApiResponse(response);
  },

  // Delete task
  deleteTask: async (taskId, customerId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/customer/${customerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get team members for task assignment
  getTeamMembersForTask: async (customerId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/team/${customerId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get all tasks with filtering and pagination
  getAllTasks: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const url = `${API_BASE_URL}/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get task statistics
  getTaskStats: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  }
};

// Note: milestoneApi removed - replaced with taskApi

// Default export - axios-like interface for profile API calls
const api = {
  get: async (url, config = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        ...config.headers
      },
      ...config
    });
    
    return {
      data: await handleApiResponse(response),
      status: response.status,
      statusText: response.statusText
    };
  },

  post: async (url, data = null, config = {}) => {
    const token = localStorage.getItem('token');
    let headers = {};
    
    // Handle FormData (for file uploads)
    if (data instanceof FormData) {
      // For FormData, only include Authorization header if token exists
      if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } else {
      // For JSON data, include Content-Type and Authorization if token exists
      headers['Content-Type'] = 'application/json';
      if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        ...headers,
        ...config.headers
      },
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...config
    });
    
    return {
      data: await handleApiResponse(response),
      status: response.status,
      statusText: response.statusText
    };
  },

  put: async (url, data = null, config = {}) => {
    const token = localStorage.getItem('token');
    let headers = {};
    
    // Handle FormData (for file uploads)
    if (data instanceof FormData) {
      // For FormData, only include Authorization header if token exists
      if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } else {
      // For JSON data, include Content-Type and Authorization if token exists
      headers['Content-Type'] = 'application/json';
      if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        ...headers,
        ...config.headers
      },
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...config
    });
    
    return {
      data: await handleApiResponse(response),
      status: response.status,
      statusText: response.statusText
    };
  },

  delete: async (url, config = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        ...config.headers
      },
      ...config
    });
    
    return {
      data: await handleApiResponse(response),
      status: response.status,
      statusText: response.statusText
    };
  },

  // Employee-specific API functions
  employee: {
    // Get employee dashboard data
    getDashboard: async () => {
      return api.get('/employee/dashboard');
    },

    // Get employee assigned customers
    getCustomers: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/employee/customers${queryString ? `?${queryString}` : ''}`);
    },

    // Get single customer details for employee
    getCustomerDetails: async (customerId) => {
      return api.get(`/employee/customers/${customerId}`);
    },

    // Get employee assigned tasks
    getTasks: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/employee/tasks${queryString ? `?${queryString}` : ''}`);
    },

    // Get single task for employee
    getTask: async (taskId) => {
      return api.get(`/employee/tasks/${taskId}`);
    },

    // Update task status
    updateTaskStatus: async (taskId, status) => {
      return api.put(`/employee/tasks/${taskId}/status`, { status });
    },

    // Get employee activity feed
    getActivity: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/employee/activity${queryString ? `?${queryString}` : ''}`);
    },

    // Get employee files
    getFiles: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/employee/files${queryString ? `?${queryString}` : ''}`);
    }
  },

  // Customer-specific API functions
  customer: {
    // Get customer dashboard data
    getDashboard: async () => {
      return api.get('/customer/dashboard');
    },

    // Get customer records
    getCustomers: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/customers${queryString ? `?${queryString}` : ''}`);
    },

    // Get single customer details
    getCustomerDetails: async (customerId) => {
      return api.get(`/customers/${customerId}`);
    },

    // Get customer activity feed
    getActivity: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/customer/activity${queryString ? `?${queryString}` : ''}`);
    },

    // Get customer files
    getFiles: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/customer/files${queryString ? `?${queryString}` : ''}`);
    }
  }
};

// Subtask API functions
export const subtaskApi = {
  // Create a new subtask
  createSubtask: async (subtaskData) => {
    const response = await fetch(`${API_BASE_URL}/subtasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: subtaskData // FormData for file uploads
    });
    
    return handleApiResponse(response);
  },

  // Get subtasks for a task
  getSubtasksByTask: async (taskId, customerId) => {
    return throttleRequest(`subtasks-task-${taskId}`, async () => {
      const response = await fetch(`${API_BASE_URL}/subtasks/task/${taskId}/customer/${customerId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleApiResponse(response);
    });
  },

  // Get single subtask
  getSubtask: async (subtaskId, taskId, customerId) => {
    return throttleRequest(`subtask-${subtaskId}`, async () => {
      const response = await fetch(`${API_BASE_URL}/subtasks/${subtaskId}/customer/${customerId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleApiResponse(response);
    });
  },

  // Update subtask
  updateSubtask: async (subtaskId, taskId, customerId, subtaskData) => {
    const response = await fetch(`${API_BASE_URL}/subtasks/${subtaskId}/customer/${customerId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: subtaskData // FormData for file uploads
    });
    
    return handleApiResponse(response);
  },

  // Delete subtask
  deleteSubtask: async (subtaskId, taskId, customerId) => {
    const response = await fetch(`${API_BASE_URL}/subtasks/${subtaskId}/customer/${customerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get subtask statistics
  getSubtaskStats: async () => {
    const response = await fetch(`${API_BASE_URL}/subtasks/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get team members for subtask assignment
  getTeamMembersForSubtask: async (customerId) => {
    return throttleRequest(`subtask-team-${customerId}`, async () => {
      const response = await fetch(`${API_BASE_URL}/tasks/team/${customerId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleApiResponse(response);
    });
  }
};

// Comment API functions
export const commentApi = {
  // Add comment to task (for PM)
  addTaskComment: async (taskId, comment) => {
    return api.post(`/tasks/${taskId}/comments`, { comment });
  },

  // Delete comment from task (for PM)
  deleteTaskComment: async (taskId, commentId) => {
    return api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  // Add comment to subtask (for PM)
  addSubtaskComment: async (subtaskId, comment) => {
    return api.post(`/subtasks/${subtaskId}/comments`, { comment });
  },

  // Delete comment from subtask (for PM)
  deleteSubtaskComment: async (subtaskId, commentId) => {
    return api.delete(`/subtasks/${subtaskId}/comments/${commentId}`);
  },

  // Add comment to task (for Employee)
  addEmployeeTaskComment: async (taskId, comment) => {
    return api.post(`/employee/tasks/${taskId}/comments`, { comment });
  },

  // Delete comment from task (for Employee)
  deleteEmployeeTaskComment: async (taskId, commentId) => {
    return api.delete(`/employee/tasks/${taskId}/comments/${commentId}`);
  },

  // Add comment to subtask (for Employee)
  addEmployeeSubtaskComment: async (subtaskId, comment) => {
    return api.post(`/employee/subtasks/${subtaskId}/comments`, { comment });
  },

  // Delete comment from subtask (for Employee)
  deleteEmployeeSubtaskComment: async (subtaskId, commentId) => {
    return api.delete(`/employee/subtasks/${subtaskId}/comments/${commentId}`);
  },

  // Add comment to task (for Customer)
  addCustomerTaskComment: async (taskId, comment) => {
    return api.post(`/customer/tasks/${taskId}/comments`, { comment });
  },

  // Delete comment from task (for Customer)
  deleteCustomerTaskComment: async (taskId, commentId) => {
    return api.delete(`/customer/tasks/${taskId}/comments/${commentId}`);
  },

  // Add comment to subtask (for Customer)
  addCustomerSubtaskComment: async (subtaskId, comment) => {
    return api.post(`/customer/subtasks/${subtaskId}/comments`, { comment });
  },

  // Delete comment from subtask (for Customer)
  deleteCustomerSubtaskComment: async (subtaskId, commentId) => {
    return api.delete(`/customer/subtasks/${subtaskId}/comments/${commentId}`);
  }
};

// Activity API functions
export const activityApi = {
  // Get activities for current user based on their role
  getActivities: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/activities${queryString ? `?${queryString}` : ''}`);
  },

  // Get activity statistics
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/activities/stats${queryString ? `?${queryString}` : ''}`);
  },

  // Get activities for a specific customer
  getCustomerActivities: async (customerId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/activities/customer/${customerId}${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific activity by ID
  getActivityById: async (activityId) => {
    return api.get(`/activities/${activityId}`);
  },

  // Create a new activity (PM only)
  createActivity: async (activityData) => {
    return api.post('/activities', activityData);
  }
};

export default api;