
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';
import Cookies from 'js-cookie';
import { MemoryRouter } from 'react-router-dom';

describe('Navbar Component Render Tests', () => {

    beforeEach(() => {
        // Clear cookies before each test to ensure clean state
        Cookies.remove('user');
        // Resize window
        global.innerWidth = 1200;
        global.dispatchEvent(new Event('resize'));
    });

    it('should render Navbar correctly for desktop view when not logged in', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        // Check if the Login and Sign Up buttons are visible
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Sign up')).toBeInTheDocument();
        expect(screen.queryByText('Sign Out')).toBeNull();
    });

    it('should render Navbar correctly for desktop view when logged in', () => {
        Cookies.set('user', JSON.stringify({ username: 'testuser' }));  // Mock logged-in state

        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        // Check if the Sign Out button is visible
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
        expect(screen.queryByText('Login')).toBeNull();
        expect(screen.queryByText('Sign up')).toBeNull();
    });

    it('should render Navbar correctly for mobile view when not logged in', () => {
        global.innerWidth = 500;
        global.dispatchEvent(new Event('resize'));
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        // Resize to enable mobile view
        
        fireEvent.click(screen.getByLabelText('menu'));

        // Check if the mobile drawer has Login and Sign Up options
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Sign up')).toBeInTheDocument();
        expect(screen.queryByText('Sign Out')).toBeNull();
    });

    it('should render Navbar correctly for mobile view when logged in', () => {
        Cookies.set('user', JSON.stringify({ username: 'testuser' }));  // Mock logged-in state
        global.innerWidth = 500;
        global.dispatchEvent(new Event('resize'));
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );
        // Resize to enable mobile view
        
        // Open the mobile drawer by clicking the menu icon
        fireEvent.click(screen.getByLabelText('menu'));

        // Check if the mobile drawer has Sign Out option
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
        expect(screen.queryByText('Login')).toBeNull();
        expect(screen.queryByText('Sign up')).toBeNull();
    });
});
