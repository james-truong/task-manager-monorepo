import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../components/Signup';
import { AuthContext } from '../context/AuthContext';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Signup Component', () => {
  const mockSignup = vi.fn();
  const mockAuthContextValue = {
    signup: mockSignup,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSignup = (contextValue = mockAuthContextValue) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={contextValue}>
          <Signup />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  it('renders signup form', () => {
    renderSignup();

    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows link to login page', () => {
    renderSignup();

    const loginLink = screen.getByRole('link', { name: /log in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('updates all form inputs on change', async () => {
    const user = userEvent.setup();
    renderSignup();

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls signup function on form submit', async () => {
    const user = userEvent.setup();
    mockSignup.mockResolvedValue({ success: true });
    renderSignup();

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signupButton);

    expect(mockSignup).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123');
  });

  it('navigates to tasks page on successful signup', async () => {
    const user = userEvent.setup();
    mockSignup.mockResolvedValue({ success: true });
    renderSignup();

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signupButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });
  });

  it('disables submit button while loading', () => {
    renderSignup({
      ...mockAuthContextValue,
      isLoading: true,
    });

    const signupButton = screen.getByRole('button', { name: /signing up/i });
    expect(signupButton).toBeDisabled();
  });

  it('prevents form submission with empty fields', async () => {
    const user = userEvent.setup();
    renderSignup();

    const signupButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(signupButton);

    // Signup should not be called with empty fields
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('prevents form submission with missing name', async () => {
    const user = userEvent.setup();
    renderSignup();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signupButton);

    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('prevents form submission with missing email', async () => {
    const user = userEvent.setup();
    renderSignup();

    const nameInput = screen.getByLabelText(/name/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(nameInput, 'John Doe');
    await user.type(passwordInput, 'password123');
    await user.click(signupButton);

    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('prevents form submission with missing password', async () => {
    const user = userEvent.setup();
    renderSignup();

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.click(signupButton);

    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('trims whitespace from inputs', async () => {
    const user = userEvent.setup();
    mockSignup.mockResolvedValue({ success: true });
    renderSignup();

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(nameInput, '  John Doe  ');
    await user.type(emailInput, '  john@example.com  ');
    await user.type(passwordInput, 'password123');
    await user.click(signupButton);

    expect(mockSignup).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123');
  });

  it('shows error toast on failed signup', async () => {
    const user = userEvent.setup();
    mockSignup.mockResolvedValue({
      success: false,
      error: 'Email already exists',
    });
    renderSignup();

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signupButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalled();
    });
  });
});
