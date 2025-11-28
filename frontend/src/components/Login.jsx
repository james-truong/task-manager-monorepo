import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Login = ({ onSwitchToSignup }) => {
  // ========== ACCESS AUTH CONTEXT ==========
  // useContext hook lets us access the AuthContext values
  const { login, error } = useContext(AuthContext);

  // ========== FORM STATE (Controlled Components) ==========
  // Store the values of our form inputs in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Track loading state while API call is in progress
  const [isLoading, setIsLoading] = useState(false);

  // Store form-specific errors (different from context error)
  const [formError, setFormError] = useState(null);

  // ========== FORM SUBMISSION ==========
  const handleSubmit = async (e) => {
    // Prevent default form submission (which would reload the page)
    e.preventDefault();

    // Clear any previous errors
    setFormError(null);

    // Validate inputs before sending to API
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    // Basic email validation
    if (!email.includes('@')) {
      setFormError('Please enter a valid email');
      return;
    }

    // Start loading state (disable button, show spinner, etc.)
    setIsLoading(true);

    try {
      // Call the login function from AuthContext
      const result = await login(email, password);

      if (!result.success) {
        // Login failed - show error
        setFormError(result.error);
      }
      // If success, AuthContext will update isAuthenticated
      // and App.jsx will automatically redirect to tasks page
    } catch (err) {
      setFormError('An unexpected error occurred');
    } finally {
      // Always stop loading, whether success or failure
      setIsLoading(false);
    }
  };

  // ========== RENDER UI ==========
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        {/* Show error message if there is one */}
        {(formError || error) && (
          <div className="error-message">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email input - controlled component */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          {/* Password input - controlled component */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Switch to signup */}
        <p className="auth-switch">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="link-button"
            disabled={isLoading}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
