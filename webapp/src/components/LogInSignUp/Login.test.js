import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Login from './Login';
import Cookies from 'js-cookie';
import { MemoryRouter } from 'react-router-dom';

describe('LogIn Component Render Tests', () => {

  it('should render LogIn component', () => {
    render(
      <MemoryRouter>
        <LogIn />
      </MemoryRouter>
    );

    // Check for the presence of LogIn form elements
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
  });

  it('should render LogIn component when user is logged in (cookie exists)', () => {
    // Mock a logged-in state
    Cookies.set('user', JSON.stringify({ username: 'testuser' }));

    render(
      <MemoryRouter>
        <LogIn />
      </MemoryRouter>
    );

    // Check that the LogIn component is rendered correctly (you may have a redirect in place, which would affect this)
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
  });
});
