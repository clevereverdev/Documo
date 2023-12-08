import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ResetPassword from '../Pages/Authentication/Reset_Password';

// Mocking external dependencies
const mockPush = jest.fn();
// Mocking external dependencies
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush, // Use the mockPush here
  }),
}));

jest.mock('../firebase/auth', () => ({
    sendPasswordResetEmail: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Reset_Password', () => {
  it('renders without crashing', () => {
    render(<ResetPassword />);
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
  });

  it('allows entering an email address', () => {
    render(<ResetPassword />);

    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@example.com' } });
    expect(screen.getByPlaceholderText('Email address').value).toBe('test@example.com');
  });

  it('renders reset link button and is clickable', () => {
    render(<ResetPassword />);
    const resetLinkButton = screen.getByText('Get the reset link');
    expect(resetLinkButton).toBeInTheDocument();
    fireEvent.click(resetLinkButton);
    // Check if sendPasswordResetEmail was called, etc.
  });

  it('navigates to login page on clicking back button', () => {
    render(<ResetPassword />);
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith('../Authentication/Login');
  });

});
