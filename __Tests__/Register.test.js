import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import RegisterForm from '../pages/Authentication/Register';

// Mocking external dependencies
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush

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



describe('RegisterForm', () => {
  it('renders without crashing', () => {
    render(<RegisterForm />);
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('allows entering a username, email, and password', () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    expect(screen.getByPlaceholderText('Username').value).toBe('testuser');
    expect(screen.getByPlaceholderText('Email address').value).toBe('test@example.com');
    expect(screen.getByPlaceholderText('Password').value).toBe('password123');
  });
  it('renders sign up button and is clickable', () => {
    render(<RegisterForm />);
    const signUpButton = screen.getByText('Sign up');
    expect(signUpButton).toBeInTheDocument();
    fireEvent.click(signUpButton);
    // You can extend this to check if certain functions were called or certain states were set
  });

  it('renders Google sign-in button and is clickable', () => {
    render(<RegisterForm />);
    const googleSignInButton = screen.getByText('Continue with Google');
    expect(googleSignInButton).toBeInTheDocument();
    fireEvent.click(googleSignInButton);
    // Check if signInWithPopup was called, etc.
  });

  it('navigates to login page on clicking login link', () => {
    render(<RegisterForm />);
    const loginLink = screen.getByText('Login');
    fireEvent.click(loginLink);
    expect(mockPush).toHaveBeenCalledWith('../Authentication/Login'); // Use mockPush in your test assertion
  });

});