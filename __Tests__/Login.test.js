import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import LoginForm from '../pages/Authentication/Login';

// Mocking external dependencies
const mockPush = jest.fn();
// Mocking external dependencies
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush, // Use the mockPush here
  }),
}));


jest.mock('../firebase/auth', () => ({
  useAuth: jest.fn().mockReturnValue({ 
    authUser: null, 
    isLoading: false,
    setAuthUser: jest.fn(), // Add this if you're using setAuthUser in the component
    // include any other functions or states you use from useAuth
  }),
}));


describe('LoginForm', () => {
  it('renders without crashing', () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText('Email address or Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('allows entering an email and password', () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText('Email address or Username'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    expect(screen.getByPlaceholderText('Email address or Username').value).toBe('test@example.com');
    expect(screen.getByPlaceholderText('Password').value).toBe('password123');
  });

  it('renders login button and is clickable', () => {
    render(<LoginForm />);
    const loginButton = screen.getByText('Log in');
    expect(loginButton).toBeInTheDocument();
    fireEvent.click(loginButton);
    // Check if signInWithEmailAndPassword was called, etc.
  });

  it('renders Google sign-in button and is clickable', () => {
    render(<LoginForm />);
    const googleSignInButton = screen.getByText('Continue with Google');
    expect(googleSignInButton).toBeInTheDocument();
    fireEvent.click(googleSignInButton);
    // Check if signInWithPopup was called, etc.
  });

  it('navigates to password reset page on clicking forgot password link', () => {
    render(<LoginForm />);
    const forgotPasswordLink = screen.getByText('Forgot your password?');
    fireEvent.click(forgotPasswordLink);
    expect(mockPush).toHaveBeenCalledWith('../Authentication/Reset_password');
  });

  it('navigates to sign up page on clicking get started link', () => {
    render(<LoginForm />);
    const signUpLink = screen.getByText('Get Started');
    fireEvent.click(signUpLink);
    expect(mockPush).toHaveBeenCalledWith('../Authentication/Register');
  });

  // Additional tests can be added here...
});
