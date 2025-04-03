import { render, screen } from '@testing-library/react';
import { Home } from './Home';
import Cookies from 'js-cookie';
import { MemoryRouter } from 'react-router-dom';

// TODO: Fix tests
describe('Home Component Render Tests', () => {
    
    beforeEach(() => {
        // Clear cookies before each test to ensure clean state
        Cookies.remove('user');
    });

    it('should work', () => {
        expect(true).toBe(true);
    });
       
    
    it('should render Home component for non-logged-in users', () => {
        Cookies.remove('user')
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        expect(screen.getByText(/wichat/i)).toBeInTheDocument();
        expect(screen.getByText(/_en1b/i)).toBeInTheDocument();

    });

    it('should render Home component for logged-in users', () => {
        Cookies.set('user', JSON.stringify({ username: 'testuser' }));  // Mock logged-in state

        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        // Check for personalized greeting message and username
        expect(screen.getByText(/Your Profile/i)).toBeInTheDocument();
        expect(screen.getByText(/New Game/i)).toBeInTheDocument();
        expect(screen.getByText(/Statistics/i)).toBeInTheDocument();
        expect(screen.getByText(/Game Modes/i)).toBeInTheDocument();
    });
    
});