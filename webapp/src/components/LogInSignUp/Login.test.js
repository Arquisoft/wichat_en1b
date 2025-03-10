import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from './Login';
import axios from 'axios';
import Cookies from 'js-cookie';

jest.mock('axios');
jest.mock('js-cookie', () => ({ set: jest.fn() }));

describe('Login Component', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  });

  beforeAll(() => {
    delete window.location;
    window.location = { reload: jest.fn() };
  })

  test('renders login form with inputs and button', () => {
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log in/i })).toBeInTheDocument();
  });

  test('updates state on user input', () => {
    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  test('handles successful login', async () => {
    axios.post.mockResolvedValue({ data: { username: 'testuser', token: '12345' } });
    const loginButton = screen.getByRole('button', { name: /Log in/i });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => expect(Cookies.set).toHaveBeenCalled());
  });

  test('handles login error', async () => {
    axios.post.mockRejectedValue({ response: { data: { error: 'Invalid credentials' } } });
    const loginButton = screen.getByRole('button', { name: /Log in/i });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => expect(screen.getByText(/Error: Invalid credentials/i)).toBeInTheDocument());
  });
});
