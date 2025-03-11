import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SignUp } from './SignUp';
import axios from 'axios';
import Cookies from 'js-cookie';

jest.mock('axios');
jest.mock('js-cookie', () => ({ set: jest.fn() }));

describe('SignUp Component', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
  });

  test('renders sign-up form with inputs and button', () => {
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  test('updates state on user input', () => {
    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
    
    expect(usernameInput.value).toBe('newuser');
    expect(passwordInput.value).toBe('newpassword');
  });

  test('handles successful user creation', async () => {
    axios.post.mockResolvedValue({ data: { username: 'newuser', token: '12345' } });
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    
    fireEvent.click(signUpButton);
    
    await waitFor(() => expect(Cookies.set).toHaveBeenCalled());
  });

  test('handles sign-up error', async () => {
    axios.post.mockRejectedValue({ response: { data: { error: 'User already exists' } } });
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    
    fireEvent.click(signUpButton);
    
    await waitFor(() => expect(screen.getByText(/User already exists/i)).toBeInTheDocument());
  });
});
