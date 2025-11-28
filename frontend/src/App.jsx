import { useState, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import TasksPage from './pages/TasksPage';
import UserPage from './pages/UserPage';
import './App.css';

// ========== MAIN APP CONTENT ==========
// This component has access to AuthContext because it's wrapped by AuthProvider
const AppContent = () => {
  // Access authentication state from context
  const { user, isAuthenticated, isLoading, logout } = useContext(AuthContext);

  // State to toggle between Login and Signup views
  const [showLogin, setShowLogin] = useState(true);

  // Dark mode state - check localStorage or default to false
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  // Apply dark mode class to document root and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // ========== LOADING STATE ==========
  // Show loading while checking if user is already logged in
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // ========== NOT AUTHENTICATED - SHOW LOGIN/SIGNUP ==========
  if (!isAuthenticated) {
    return (
      <div className="app">
        {/* Conditional rendering - show either Login or Signup */}
        {showLogin ? (
          <Login onSwitchToSignup={() => setShowLogin(false)} />
        ) : (
          <Signup onSwitchToLogin={() => setShowLogin(true)} />
        )}
      </div>
    );
  }

  // ========== AUTHENTICATED - SHOW APP WITH ROUTING ==========
  return (
    <div className="app">
      {/* Header with navigation and user info */}
      <header className="app-header">
        <h1>Task Manager</h1>

        {/* Navigation Links */}
        <nav className="app-nav">
          <Link to="/tasks" className="nav-link">Tasks</Link>
          <Link to="/user" className="nav-link">Profile</Link>
        </nav>

        {/* Dark mode toggle and user info */}
        <div className="user-info">
          <button
            onClick={toggleDarkMode}
            className="btn-icon dark-mode-toggle"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <span>Welcome, {user?.name}!</span>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {/* Main content area with routes */}
      <main className="app-main">
        <Routes>
          {/* Redirect root to /tasks */}
          <Route path="/" element={<Navigate to="/tasks" replace />} />

          {/* Tasks page route */}
          <Route path="/tasks" element={<TasksPage />} />

          {/* User profile page route */}
          <Route path="/user" element={<UserPage />} />
        </Routes>
      </main>
    </div>
  );
};

// ========== ROOT APP COMPONENT ==========
// This is the top-level component that wraps everything with AuthProvider and Router
const App = () => {
  return (
    // BrowserRouter enables routing throughout the app
    <BrowserRouter>
      {/* AuthProvider makes auth state available to all child components */}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
