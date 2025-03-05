import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import SignUp from './SignUp';  // Import the SignUp component
import Cookies from 'js-cookie';
import { MemoryRouter } from 'react-router-dom';

describe('SignUp Component Render Tests', () => {

  it('should render SignUp component', () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    // Check for the presence of SignUp form elements
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('should render SignUp component when user is logged in (cookie exists)', () => {
    // Mock a logged-in state
    Cookies.set('user', JSON.stringify({ username: 'testuser' }));

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    // Check that the SignUp component is rendered correctly (you may have a redirect in place, which would affect this)
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });
});