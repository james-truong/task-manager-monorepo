import { useState, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import TasksPage from './pages/TasksPage';
import UserPage from './pages/UserPage';
import './App.css';

// ========== AUTHENTICATED APP LAYOUT ==========
// This component renders the header and navigation for authenticated users
const AuthenticatedLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

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

      {/* Main content area */}
      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

// ========== MAIN APP CONTENT ==========
// This component defines all routes for the application
const AppContent = () => {
  return (
    <Routes>
      {/* Public routes - anyone can access */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes - require authentication */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/tasks" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <TasksPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <UserPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
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
        {/* Toast notification container */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--card-bg)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
            },
            success: {
              iconTheme: {
                primary: 'var(--success-color)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--danger-color)',
                secondary: 'white',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
