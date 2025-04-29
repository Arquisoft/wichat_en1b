import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

import "..w/"
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  })
}));

describe('App Render Tests', () => {
    test('renders welcome message', () => {
      render(
        <App />
      );
      const wichat = screen.getByText('wichat')
      const _en1b = screen.getByText('_en1b')
      const navBarText = screen.getByText(/wichat_en1b/i)
      const loginButton = screen.getByText("navBar.logIn");
      const signupButton = screen.getByText("navBar.signUp");

      expect(wichat).toBeInTheDocument();
      expect(_en1b).toBeInTheDocument();
      expect(navBarText).toBeInTheDocument();
      expect(loginButton).toBeInTheDocument();
      expect(signupButton).toBeInTheDocument();

    });
});