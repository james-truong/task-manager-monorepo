import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Signup = ({ onSwitchToLogin }) => {
  // ========== ACCESS AUTH CONTEXT ==========
  const { signup, error } = useContext(AuthContext);

  // ========== FORM STATE (Controlled Components) ==========
  // Signup needs one extra field (name) compared to Login
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Track loading state
  const [isLoading, setIsLoading] = useState(false);

  // Store form-specific errors
  const [formError, setFormError] = useState(null);

  // ========== FORM SUBMISSION ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validate all fields are filled
    if (!name || !email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    // Validate email format
    if (!email.includes('@')) {
      setFormError('Please enter a valid email');
      return;
    }

    // Validate password length (your API might have requirements)
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Call the signup function from AuthContext
      const result = await signup(name, email, password);

      if (!result.success) {
        setFormError(result.error);
      }
      // If success, user is automatically logged in
      // AuthContext updates isAuthenticated = true
    } catch (err) {
      setFormError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== RENDER UI ==========
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up</h2>

        {/* Show error message if there is one */}
        {(formError || error) && (
          <div className="error-message">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={isLoading}
            />
          </div>

          {/* Email input */}
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

          {/* Password input */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min 6 characters)"
              disabled={isLoading}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Switch to login */}
        <p className="auth-switch">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="link-button"
            disabled={isLoading}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
