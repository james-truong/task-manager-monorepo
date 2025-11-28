// API service for communicating with the task-manager-api backend
// This handles all HTTP requests and includes authentication headers

// API URL configuration:
// - Production (Vercel monorepo): Use /api (same domain, routed by vercel.json)
// - Development: Use localhost:3000 (separate backend server)
// - Can be overridden with VITE_API_URL environment variable
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3000');

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    // If there's an error message from the server, use it
    const error = data.error || 'Something went wrong';
    throw new Error(error);
  }

  return data;
};

// ==================== AUTH API ====================

export const authAPI = {
  // Signup a new user
  signup: async (name, email, password) => {
    const response = await fetch(`${API_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await handleResponse(response);

    // Save token to localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },

  // Login existing user
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await handleResponse(response);

    // Save token to localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },

  // Logout current user
  logout: async () => {
    const response = await fetch(`${API_URL}/users/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    // Remove token from localStorage
    localStorage.removeItem('token');

    return handleResponse(response);
  },

  // Get current user profile
  getProfile: async () => {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  }
};

// ==================== TASKS API ====================

export const tasksAPI = {
  // Get all tasks (with optional filters)
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.completed !== undefined) {
      params.append('completed', filters.completed);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    if (filters.skip) {
      params.append('skip', filters.skip);
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }

    const queryString = params.toString();
    const url = queryString ? `${API_URL}/tasks?${queryString}` : `${API_URL}/tasks`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  },

  // Get single task by ID
  getTask: async (id) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  },

  // Create a new task
  createTask: async (description, completed = false, dueDate = null, priority = 'medium') => {
    const body = { description, completed, priority };

    // Only include dueDate if it's provided
    if (dueDate) {
      body.dueDate = dueDate;
    }

    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });

    return handleResponse(response);
  },

  // Update a task
  updateTask: async (id, updates) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });

    return handleResponse(response);
  },

  // Delete a task
  deleteTask: async (id) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  }
};
