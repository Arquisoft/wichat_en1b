import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Chat } from './Chat';
import axios from 'axios';
import { useGame } from '../GameContext';

// Mock the axios module
jest.mock('axios');

// Mock the useGame hook
jest.mock('../GameContext', () => ({
    useGame: jest.fn()
}));

// Mock the refs
const mockScrollIntoView = jest.fn();
window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

describe('Chat Component', () => {
    const mockGameContext = {
        question: { question: 'Test question?' },
        gameEnded: false,
        setGameEnded: jest.fn()
    };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup default mock implementation for useGame
        useGame.mockReturnValue(mockGameContext);

        // Mock environment variable
        process.env.REACT_APP_API_ENDPOINT = 'http://test-api.com';
    });

    test('renders chat component in collapsed state initially', () => {
        render(<Chat />);

        // Check that the chat icon button is visible
        expect(screen.getByText('Chat Assistant')).toBeInTheDocument();

        // The chat should be closed initially (width: 56px)
        const chatContainer = screen.getByText('Chat Assistant').closest('div').parentElement.parentElement;
        expect(chatContainer).toHaveStyle('width: 56px');
    });

    test('toggles sidebar when toggle button is clicked', () => {
        render(<Chat />);

        // Find and click the toggle button
        const toggleButton = screen.getByRole('button', { name: 'toggleSidebar' }); // The chevron button
        fireEvent.click(toggleButton);

        // The chat should now be open
        const chatContainer = screen.getByText('Chat Assistant').closest('div').parentElement.parentElement;
        expect(chatContainer).toHaveStyle('width: 25%');

        // Click again to close
        fireEvent.click(toggleButton);
        expect(chatContainer).toHaveStyle('width: 56px');
    });

    test('displays empty state when no messages', () => {
        render(<Chat />);

        // Open the chat
        const toggleButton = screen.getByRole('button', { name: 'toggleSidebar' });
        fireEvent.click(toggleButton);

        // Check for empty state message
        expect(screen.getByText('Ask me anything about the quiz!')).toBeInTheDocument();
    });

    test('sends message and displays response', async () => {
        // Mock successful API response
        axios.post.mockResolvedValueOnce({
            data: { answer: 'This is a test response' }
        });

        render(<Chat />);

        // Open the chat
        const toggleButton = screen.getByRole('button', { name: 'toggleSidebar' });
        fireEvent.click(toggleButton);

        // Type a message
        const input = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(input, { target: { value: 'Hello, test message' } });

        // Submit the form
        const sendButton = screen.getByRole('button', { name: 'Send message' }); // The send button
        fireEvent.click(sendButton);

        // Check that the user message is displayed
        expect(screen.getByText('Hello, test message')).toBeInTheDocument();

        // Check that the API was called with correct parameters
        expect(axios.post).toHaveBeenCalledWith('http://test-api.com/askllm', {
            gameQuestion: 'Test question?',
            userQuestion: 'Hello, test message'
        });

        // Wait for the response to be displayed
        await waitFor(() => {
            expect(screen.getByText('This is a test response')).toBeInTheDocument();
        });

        // Check that the input was cleared
        expect(input.value).toBe('');
    });

    test('handles API error', async () => {
        // Mock API error
        axios.post.mockRejectedValueOnce(new Error('API Error'));

        render(<Chat />);

        // Open the chat
        const toggleButton = screen.getByRole('button', { name: 'toggleSidebar' });
        fireEvent.click(toggleButton);

        // Type and send a message
        const input = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(input, { target: { value: 'Test message' } });

        const sendButton = screen.getByRole('button', { name: 'Send message' });
        fireEvent.click(sendButton);

        // Wait for the error message
        await waitFor(() => {
            expect(screen.getByText('Sorry, there was an error processing your request. Please try again.')).toBeInTheDocument();
        });
    });

    test('clears messages when game ends', () => {
        // Setup with messages
        const { rerender } = render(<Chat />);

        // Open the chat
        const toggleButton = screen.getByRole('button', { name: 'toggleSidebar' });
        fireEvent.click(toggleButton);

        // Manually set messages (we can't directly modify state in tests)
        // So we'll simulate a message exchange
        axios.post.mockResolvedValueOnce({
            data: { answer: 'Test response' }
        });

        // Type and send a message
        const input = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(input, { target: { value: 'Test message' } });

        const sendButton = screen.getByRole('button', { name: 'Send message' });
        fireEvent.click(sendButton);

        // Now simulate game ending
        useGame.mockReturnValue({
            ...mockGameContext,
            gameEnded: true
        });

        // Re-render with new context
        rerender(<Chat />);

        // Check that messages are cleared (empty state message is shown)
        expect(screen.getByText('Ask me anything about the quiz!')).toBeInTheDocument();

        // Check that setGameEnded was called
        expect(mockGameContext.setGameEnded).toHaveBeenCalledWith(false);
    });

    test('disables input and send button when loading', async () => {
        // Mock a delayed API response to test loading state
        let resolvePromise;
        const promise = new Promise(resolve => {
            resolvePromise = resolve;
        });

        axios.post.mockImplementationOnce(() => promise);

        render(<Chat />);

        // Open the chat
        const toggleButton = screen.getByRole('button', { name: 'toggleSidebar' });
        fireEvent.click(toggleButton);

        // Type and send a message
        const input = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(input, { target: { value: 'Test message' } });

        const sendButton = screen.getByRole('button', { name: 'Send message' });
        fireEvent.click(sendButton);

        // Check that input is disabled during loading
        expect(input).toBeDisabled();

        // Check that loading indicator is shown
        expect(screen.getByText('Thinking...')).toBeInTheDocument();

        // Resolve the API call
        resolvePromise({ data: { answer: 'Test response' } });

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
        });

        // Input should be enabled again
        expect(input).not.toBeDisabled();
    });
});