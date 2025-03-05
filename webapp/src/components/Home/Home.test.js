import { render, screen } from '@testing-library/react';
import Home from './Home';
import Cookies from 'js-cookie';
import { MemoryRouter } from 'react-router-dom';

describe('Home Component Render Tests', () => {

    beforeEach(() => {
        // Clear cookies before each test to ensure clean state
        Cookies.remove('user');
    });

    it('should render Home component for non-logged-in users', () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        // Check for generic greeting message and "Login" prompt
        expect(screen.getByText('Welcome to the 2025 edition of the Software Architecture course!')).toBeInTheDocument();
        expect(screen.getByText("You're not logged into the app!!")).toBeInTheDocument();
    });

    it('should render Home component for logged-in users', () => {
        Cookies.set('user', JSON.stringify({ username: 'testuser' }));  // Mock logged-in state

        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        // Check for personalized greeting message and username
        expect(screen.getByText('Welcome to the 2025 edition of the Software Architecture course!')).toBeInTheDocument();
        expect(screen.getByText("You're logged as testuser!!")).toBeInTheDocument();
    });
});
