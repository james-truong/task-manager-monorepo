import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../components/Login';
import { AuthContext } from '../context/AuthContext';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

describe('Login Component', () => {
  const mockLogin = vi.fn();
  const mockAuthContextValue = {
    login: mockLogin,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = (contextValue = mockAuthContextValue) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={contextValue}>
          <Login />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  it('renders login form', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows link to signup page', () => {
    renderLogin();

    const signupLink = screen.getByRole('link', { name: /sign up/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('updates email input on change', async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('updates password input on change', async () => {
    const user = userEvent.setup();
    renderLogin();

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'password123');

    expect(passwordInput).toHaveValue('password123');
  });

  it('calls login function on form submit', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: true });
    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('navigates to tasks page on successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: true });
    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });
  });

  it('disables submit button while loading', () => {
    renderLogin({
      ...mockAuthContextValue,
      isLoading: true,
    });

    const loginButton = screen.getByRole('button', { name: /logging in/i });
    expect(loginButton).toBeDisabled();
  });

  it('shows error message on failed login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    });
    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('prevents form submission with empty fields', async () => {
    const user = userEvent.setup();
    renderLogin();

    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    // Login should not be called with empty fields
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('trims whitespace from email input', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: true });
    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, '  test@example.com  ');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
