import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Chat } from './Chat';
import axios from 'axios';
import { useGame } from '../GameContext';

jest.mock('axios');



jest.mock('../GameContext', () => ({
    useGame: jest.fn()
}));

const mockScrollIntoView = jest.fn();
window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

describe('Chat Component', () => {
    const mockQuestion = {
        id: '123',
        question: 'Which image shows a cat?',
        images: [
            'https://example.com/cat.jpg',
            'https://example.com/dog.jpg',
            'https://example.com/bird.jpg',
            'https://example.com/fish.jpg'
        ]
    };

    const mockGameContext = {
        question: mockQuestion,
        setQuestion: jest.fn(),
        gameEnded: false,
        setGameEnded: jest.fn(),
        questionType: 'random',
        setQuestionType: jest.fn(),
        AIAttempts: 0,
        setAIAttempts: jest.fn(),
        maxAIAttempts: 3,
        setMaxAIAttempts: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();

        useGame.mockReturnValue(mockGameContext);
        process.env.REACT_APP_API_ENDPOINT = 'http://test-api.com';
    });

    test('renders chat component in collapsed state initially', () => {
        render(<Chat />);

        expect(screen.getByText('Chat Assistant')).toBeInTheDocument();

        const chatContainer = screen.getByText('Chat Assistant').closest('div').parentElement.parentElement;
        expect(chatContainer).toHaveStyle('width: 56px');
    });

    test('toggles sidebar when toggle button is clicked', () => {
        render(<Chat />);

        const toggleButton = screen.getByRole('button', { name: 'toggleSidebar' }); // The chevron button
        fireEvent.click(toggleButton);

        const chatContainer = screen.getByText('Chat Assistant').closest('div').parentElement.parentElement;
        expect(chatContainer).toHaveStyle('width: 25%');

        fireEvent.click(toggleButton);
        expect(chatContainer).toHaveStyle('width: 56px');
    });

    test('displays empty state when no messages', () => {
        render(<Chat />);

        const toggleButton = screen.getByRole('button', { name: 'toggleSidebar' });
        fireEvent.click(toggleButton);
        expect(screen.getByText('Ask me anything about the question!')).toBeInTheDocument();
    });

    test('sends message and displays response', async () => {
        axios.post.mockResolvedValueOnce({
            data: { answer: 'This is a test response' }
        });

        render(<Chat />);

        const toggleButton = screen.getByRole('button', { name: 'toggleSidebar' });
        fireEvent.click(toggleButton);

        const input = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(input, { target: { value: 'Hello, test message' } });

        const sendButton = screen.getByRole('button', { name: 'Send message' }); // The send button
        fireEvent.click(sendButton);

        expect(screen.getByText('Hello, test message')).toBeInTheDocument();

        expect(axios.post).toHaveBeenCalledWith('http://test-api.com/askllm', {
            gameQuestion: mockQuestion.question,
            userQuestion: 'Hello, test message'
        });

        await waitFor(() => {
            expect(screen.getByText('This is a test response')).toBeInTheDocument();
        });

        expect(input.value).toBe('');
    });

    test('handles API error', async () => {
        axios.post.mockRejectedValueOnce(new Error('API Error'));

        render(<Chat />);

        const toggleButton = screen.getByRole('button', { name: 'toggleSidebar' });
        fireEvent.click(toggleButton);

        const input = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(input, { target: { value: 'Test message' } });

        const sendButton = screen.getByRole('button', { name: 'Send message' });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText('Sorry, there was an error processing your request. Please try again.')).toBeInTheDocument();
        });
    });

    test('clears messages when game ends', () => {
        const { rerender } = render(<Chat />);

        const toggleButton = screen.getByRole('button', { name: 'toggleSidebar' });
        fireEvent.click(toggleButton);

        axios.post.mockResolvedValueOnce({
            data: { answer: 'Test response' }
        });

        const input = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(input, { target: { value: 'Test message' } });

        const sendButton = screen.getByRole('button', { name: 'Send message' });
        fireEvent.click(sendButton);

        useGame.mockReturnValue({
            ...mockGameContext,
            gameEnded: true
        });

        rerender(<Chat />);

        expect(screen.getByText('Ask me anything about the question!')).toBeInTheDocument();
    });

    test('disables input and send button when loading', async () => {
        let resolvePromise;
        const promise = new Promise(resolve => {
            resolvePromise = resolve;
        });

        axios.post.mockImplementationOnce(() => promise);

        render(<Chat />);

        const toggleButton = screen.getByRole('button', { name: 'toggleSidebar' });
        fireEvent.click(toggleButton);

        const input = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(input, { target: { value: 'Test message' } });

        const sendButton = screen.getByRole('button', { name: 'Send message' });
        fireEvent.click(sendButton);

        expect(input).toBeDisabled();

        expect(screen.getByText('Thinking...')).toBeInTheDocument();

        resolvePromise({ data: { answer: 'Test response' } });

        await waitFor(() => {
            expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
        });

        expect(input).not.toBeDisabled();
    });
});