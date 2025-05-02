import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ProtectedLayout, PublicLayout } from './ProtectedLayout';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Navigate: jest.fn(() => null)
}));

jest.mock('js-cookie', () => ({
    get: jest.fn(),
}));

describe('ProtectedLayout', () => {
    it('redirects to /login if user is not logged in', () => {
        const { Navigate } = require('react-router-dom');
        Cookies.get.mockReturnValue(undefined);

        render(
            <MemoryRouter>
                <ProtectedLayout />
            </MemoryRouter>
        );

        expect(Navigate).toHaveBeenCalledWith({ to: '/login' }, {});
    });

    it('renders child components if user is logged in', () => {
        const { Navigate } = require('react-router-dom');
        Cookies.get.mockReturnValue('mockUser');

        render(
            <MemoryRouter>
                <ProtectedLayout />
            </MemoryRouter>
        );

        expect(Navigate).not.toHaveBeenCalled();
    });
});

describe('PublicLayout', () => {
    it('redirects to /home if user is logged in', () => {
        const { Navigate } = require('react-router-dom');
        Cookies.get.mockReturnValue('mockUser');

        render(
            <MemoryRouter>
                <PublicLayout />
            </MemoryRouter>
        );

        expect(Navigate).toHaveBeenCalledWith({ to: '/home' }, {});
    });

    it('renders child components if user is not logged in', () => {
        const { Navigate } = require('react-router-dom');
        Cookies.get.mockReturnValue(undefined);

        render(
            <MemoryRouter>
                <PublicLayout />
            </MemoryRouter>
        );

        expect(Navigate).not.toHaveBeenCalled();
    });
});