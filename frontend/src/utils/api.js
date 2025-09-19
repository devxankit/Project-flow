// API utility functions for user management
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  // Handle 429 (Too Many Requests) without trying to parse JSON
  if (response.status === 429) {
    throw new Error('Too many requests. Please wait a moment and try again.');
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
      throw new Error('Authentication failed. Please login again.');
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
  return {
    'Authorization': `Bearer ${token}`
  };
};

// Project Management API functions
export const projectApi = {
  // Get all projects with pagination and filters
  getAllProjects: async (params = {}) => {
    const queryKey = `projects-${JSON.stringify(params)}`;
    return throttleRequest(queryKey, async () => {
      const queryParams = new URLSearchParams();
      
      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const url = `${API_BASE_URL}/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleApiResponse(response);
    });
  },

  // Get single project by ID
  getProjectById: async (projectId) => {
    return throttleRequest(`project-${projectId}`, async () => {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleApiResponse(response);
    });
  },

  // Create new project
  createProject: async (projectData) => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    
    return handleApiResponse(response);
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    
    return handleApiResponse(response);
  },

  // Delete project
  deleteProject: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get project statistics
  getProjectStats: async () => {
    const response = await fetch(`${API_BASE_URL}/projects/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get users for project assignment
  getUsersForProject: async (type = null) => {
    const url = type ? `${API_BASE_URL}/projects/users?type=${type}` : `${API_BASE_URL}/projects/users`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  }
};

// Task API functions
export const taskApi = {
  // Create a new task
  createTask: async (taskData, attachments = []) => {
    if (attachments.length > 0) {
      const formData = new FormData();
      formData.append('taskData', JSON.stringify(taskData));
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
      
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      return handleApiResponse(response);
    } else {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData)
      });
      
      return handleApiResponse(response);
    }
  },

  // Get tasks for a milestone
  getTasksByMilestone: async (milestoneId, projectId) => {
    return throttleRequest(`tasks-${milestoneId}-${projectId}`, async () => {
      const response = await fetch(`${API_BASE_URL}/tasks/milestone/${milestoneId}/project/${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleApiResponse(response);
    });
  },

  // Get single task
  getTask: async (taskId, projectId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/project/${projectId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Update task
  updateTask: async (taskId, projectId, taskData, attachments = []) => {
    if (attachments.length > 0) {
      const formData = new FormData();
      formData.append('taskData', JSON.stringify(taskData));
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
      
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/project/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      return handleApiResponse(response);
    } else {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/project/${projectId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData)
      });
      
      return handleApiResponse(response);
    }
  },

  // Delete task
  deleteTask: async (taskId, projectId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/project/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get team members for task assignment
  getTeamMembersForTask: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/team/${projectId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get all tasks with filtering and pagination
  getAllTasks: async (params = {}) => {
    console.log('getAllTasks function called with params:', params);
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

// Milestone Management API functions
export const milestoneApi = {
  // Get milestones for a project
  getMilestonesByProject: async (projectId) => {
    return throttleRequest(`milestones-${projectId}`, async () => {
      const response = await fetch(`${API_BASE_URL}/milestones/project/${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return handleApiResponse(response);
    });
  },

  // Get single milestone
  getMilestone: async (milestoneId, projectId) => {
    const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/project/${projectId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Create new milestone
  createMilestone: async (milestoneData, attachments = []) => {
    console.log('API: Creating milestone with data:', milestoneData);
    console.log('API: Attachments received:', attachments);
    console.log('API: Attachments length:', attachments.length);
    
    if (attachments.length > 0) {
      // Use FormData if there are attachments
      const formData = new FormData();
      
      // Add milestone data as JSON string
      formData.append('milestoneData', JSON.stringify(milestoneData));
      console.log('API: Added milestoneData to FormData');
      
      // Add attachments
      attachments.forEach((file, index) => {
        console.log(`API: Adding file ${index}:`, file.name, file.type, file.size);
        formData.append('attachments', file);
      });
      
      console.log('API: Sending FormData request');
      const response = await fetch(`${API_BASE_URL}/milestones`, {
        method: 'POST',
        headers: getAuthHeadersForUpload(),
        body: formData
      });
      
      return handleApiResponse(response);
    } else {
      // Use JSON if no attachments
      console.log('API: Sending JSON request (no attachments)');
      const response = await fetch(`${API_BASE_URL}/milestones`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(milestoneData)
      });
      
      return handleApiResponse(response);
    }
  },

  // Update milestone
  updateMilestone: async (milestoneId, projectId, milestoneData, attachments = []) => {
    const formData = new FormData();
    
    // Add milestone data
    Object.entries(milestoneData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    // Add attachments
    attachments.forEach((file, index) => {
      formData.append('attachments', file);
    });
    
    const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/project/${projectId}`, {
      method: 'PUT',
      headers: getAuthHeadersForUpload(),
      body: formData
    });
    
    return handleApiResponse(response);
  },

  // Delete milestone
  deleteMilestone: async (milestoneId, projectId) => {
    const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/project/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Get team members for milestone assignment
  getTeamMembersForMilestone: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/milestones/team/${projectId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Debug milestone attachment details
  debugAttachment: async (milestoneId, projectId, attachmentId) => {
    const url = `${API_BASE_URL}/milestones/${milestoneId}/project/${projectId}/attachment/${attachmentId}/debug`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse(response);
  },

  // Download milestone attachment
  downloadAttachment: async (milestoneId, projectId, attachmentId) => {
    const url = `${API_BASE_URL}/milestones/${milestoneId}/project/${projectId}/attachment/${attachmentId}/download`;
    
    try {
      console.log('Starting file download...');
      
      // Fetch the file directly from our backend (which proxies from Cloudinary)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      console.log('Download response status:', response.status, response.statusText);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('File access denied. Please check your permissions.');
        } else if (response.status === 404) {
          throw new Error('File not found. The file may have been moved or deleted.');
        } else {
          throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'download';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      console.log('Downloaded filename:', filename);
      
      // Convert response to blob
      const blob = await response.blob();
      console.log('File blob created:', blob);
      
      // Create download link
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        console.log('Blob URL cleaned up');
      }, 1000);
      
      console.log('Download completed successfully');
      
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }
};