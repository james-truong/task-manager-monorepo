import React from 'react';

// ========== ERROR BOUNDARY COMPONENT ==========
// Catches JavaScript errors anywhere in the component tree
// Shows a fallback UI instead of crashing the entire app
// This is a class component because React doesn't support error boundaries as hooks yet

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  // This lifecycle method is called when an error is thrown
  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  // This lifecycle method logs error details
  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Store error details in state
    this.setState({
      error,
      errorInfo
    });

    // In production, you could send this to an error reporting service like Sentry:
    // logErrorToService(error, errorInfo);
  }

  // Reset error state and reload the page
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    // Reload the page to start fresh
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Error UI - shown when an error occurs
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-card">
            <h1>Oops! Something went wrong</h1>
            <p>We're sorry for the inconvenience. The application encountered an unexpected error.</p>

            {/* Show error details in development mode */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn btn-primary">
                Return to Home
              </button>
              <button onClick={() => window.location.reload()} className="btn btn-secondary">
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    // No error - render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
