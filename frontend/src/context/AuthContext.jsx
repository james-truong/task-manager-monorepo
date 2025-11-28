import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create the AuthContext - this is like creating a "global variable" that any component can access
export const AuthContext = createContext();

// AuthProvider component that wraps the entire app
// Any child component can access the values we provide here
export const AuthProvider = ({ children }) => {
  // ========== STATE MANAGEMENT ==========

  // Store the current user's data (name, email, etc.)
  const [user, setUser] = useState(null);

  // Track if user is logged in (true/false)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Track if we're still checking authentication status
  // This prevents flashing login screen while checking for existing token
  const [isLoading, setIsLoading] = useState(true);

  // Store any authentication errors (e.g., "Invalid password")
  const [error, setError] = useState(null);

  // ========== CHECK AUTH ON APP LOAD ==========

  // This runs ONCE when the app first loads
  useEffect(() => {
    const checkAuth = async () => {
      // Check if there's a token saved in localStorage
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Verify token is still valid by fetching user profile
          // If token expired, this will throw an error
          const userData = await authAPI.getProfile();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          // Token is invalid or expired, clear it
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }

      // Done checking - show the app
      setIsLoading(false);
    };

    checkAuth();
  }, []); // Empty array = run once on mount

  // ========== AUTH FUNCTIONS ==========

  // Signup function - creates new user account
  const signup = async (name, email, password) => {
    try {
      setError(null); // Clear any previous errors
      const data = await authAPI.signup(name, email, password);
      setUser(data.user); // Store user data
      setIsAuthenticated(true); // Mark as logged in
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Login function - authenticates existing user
  const login = async (email, password) => {
    try {
      setError(null); // Clear any previous errors
      const data = await authAPI.login(email, password);
      setUser(data.user); // Store user data
      setIsAuthenticated(true); // Mark as logged in
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Logout function - clears user session
  const logout = async () => {
    try {
      await authAPI.logout(); // Tell backend to invalidate token
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local state, even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // ========== PROVIDE VALUES TO APP ==========

  // Everything in this object is accessible to child components
  const value = {
    user,              // Current user data
    isAuthenticated,   // Is user logged in?
    isLoading,         // Are we checking auth status?
    error,             // Any error messages
    signup,            // Function to signup
    login,             // Function to login
    logout             // Function to logout
  };

  // Wrap children with Provider - now all child components can access 'value'
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
