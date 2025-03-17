import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
  render(
  <React.StrictMode>  
    <App />
  </React.StrictMode>  
);
  const navbar = screen.getByText(/wichat_en1b/i);
  expect(navbar).toBeInTheDocument();
});


