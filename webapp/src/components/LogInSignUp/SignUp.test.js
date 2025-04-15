import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SignUp } from './SignUp';
import axios from 'axios';
import Cookies from 'js-cookie';

jest.mock('axios');
jest.mock('js-cookie', () => ({ set: jest.fn() }));

// TODO: Fix tests
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
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  test('updates state on user input for sign up', () => {
    const usernameSignUpInput = screen.getByLabelText(/Username/i);
    const passwordSignUpInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');

    fireEvent.change(usernameSignUpInput, { target: { value: 'newuser' } });
    fireEvent.change(passwordSignUpInput, { target: { value: 'newpassword' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword' } });

    expect(usernameSignUpInput.value).toBe('newuser');
    expect(passwordSignUpInput.value).toBe('newpassword');
    expect(confirmPasswordInput.value).toBe('newpassword');
  });

  test('handles successful user creation', async () => {
    axios.post.mockResolvedValue({ data: { username: 'newuser', token: '12345' } });
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    
    fireEvent.click(signUpButton);
    
    await waitFor(() => expect(Cookies.set).toHaveBeenCalled());
  });

  test('handles sign-up error', async () => {
    axios.post.mockRejectedValue({ response: { data: { error: 'The username provided is already in use. Please choose a different one.' } } });
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    
    fireEvent.click(signUpButton);
    
    await waitFor(() => expect(screen.getByText('The username provided is already in use. Please choose a different one.')).toBeInTheDocument());
  });

  test('shows error if password is invalid', async () => {
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'invaliduser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'weakpass' } }); // no mayus, no symbols
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'weakpass' } });
  
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'Invalid password. It must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'}}});
  
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(signUpButton);
  
    await waitFor(() => {
      expect(screen.getByText('Invalid password. It must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.')).toBeInTheDocument();
    });
  });

  test('shows error if passwords do not match', async () => {
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'mismatchuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Valid123!' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Different123!' } });
  
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'The password and the confirmation do not match, please try again.'}}});
  
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(signUpButton);
  
    await waitFor(() => {
      expect(screen.getByText('The password and the confirmation do not match, please try again.')).toBeInTheDocument();
    });
  });
  
});
