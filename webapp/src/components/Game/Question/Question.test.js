import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Question } from './Question';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useGame } from '../GameContext';

jest.mock('axios');
jest.mock('js-cookie');
jest.mock('../GameContext', () => ({
    useGame: jest.fn()
}));

global.Image = function imageFunction() {
        setTimeout(() => {
            if (this.onload) this.onload();
        }, 100);
    }


describe('Question Component', () => {
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
        setGameEnded: jest.fn()
    };

    const mockUserCookie = JSON.stringify({ token: 'fake-jwt-token' });

    beforeEach(() => {
        jest.clearAllMocks();

        useGame.mockReturnValue(mockGameContext);
        Cookies.get.mockImplementation((name) => {
            if (name === 'user') return mockUserCookie;
            return null;
        });

        process.env.GATEWAY_SERVICE_URL = 'http://test-gateway.com';

        axios.get.mockResolvedValue({ data: mockQuestion });

        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders the question and timer', async () => {
        render(<Question />);

        await waitFor(() => {
            expect(screen.getByText('Which image shows a cat?')).toBeInTheDocument();
        });

        expect(screen.getByText('01:00')).toBeInTheDocument();
    });

    test('fetches a question on initial render', async () => {
        render(<Question />);

        expect(axios.get).toHaveBeenCalledWith('http://test-gateway.com/question');

        await waitFor(() => {
            expect(mockGameContext.setQuestion).toHaveBeenCalled();
        });
    });

    test('loads images and starts timer when question is set', async () => {
        render(<Question />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        expect(screen.getByText('01:00')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(screen.getByText('00:55')).toBeInTheDocument();
    });

    test('handles correct answer selection', async () => {
        axios.post.mockResolvedValueOnce({ data: { correct: true } });

        render(<Question />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        const images = screen.getAllByRole('img');
        fireEvent.click(images[0].closest('button'));

        expect(axios.post).toHaveBeenCalledWith('http://test-gateway.com/answer', {
            questionId: '123',
            answer: 'https://example.com/cat.jpg'
        });

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:8005/statistics',
                { questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 },
                { headers: { 'Authorization': 'Bearer fake-jwt-token' } }
            );
        });

        expect(axios.post).toHaveBeenCalledTimes(2);
    });

    test('handles incorrect answer selection', async () => {
        axios.post.mockResolvedValueOnce({ data: { correct: false } });

        render(<Question />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        const images = screen.getAllByRole('img');
        fireEvent.click(images[1].closest('button'));

        expect(axios.post).toHaveBeenCalledWith('http://test-gateway.com/answer', {
            questionId: '123',
            answer: 'https://example.com/dog.jpg'
        });

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:8005/statistics',
                { questionsAnswered: 1, correctAnswers: 0, incorrectAnswers: 1 },
                { headers: { 'Authorization': 'Bearer fake-jwt-token' } }
            );
        });

        expect(axios.post).toHaveBeenCalledTimes(2);
    });

    test('handles time running out', async () => {
        render(<Question />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        act(() => {
            jest.advanceTimersByTime(60000);
        });

        expect(screen.getByText('You ran out of time!')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(axios.get).toHaveBeenCalledTimes(2);
    });

    test('updates statistics when logged in user answers correctly', async () => {
        axios.post.mockImplementation((url) => {
            if (url === 'http://test-gateway.com/answer') {
                return Promise.resolve({ data: { correct: true } });
            }
            return Promise.resolve({ data: {} });
        });

        render(<Question />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        const images = screen.getAllByRole('img');
        fireEvent.click(images[0].closest('button'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:8005/statistics',
                { questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 },
                { headers: { 'Authorization': 'Bearer fake-jwt-token' } }
            );
        });
    });

    test('updates statistics when logged in user answers incorrectly', async () => {
        axios.post.mockImplementation((url) => {
            if (url === 'http://test-gateway.com/answer') {
                return Promise.resolve({ data: { correct: false } });
            }
            return Promise.resolve({ data: {} });
        });

        render(<Question />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        const images = screen.getAllByRole('img');
        fireEvent.click(images[1].closest('button'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:8005/statistics',
                { questionsAnswered: 1, correctAnswers: 0, incorrectAnswers: 1 },
                { headers: { 'Authorization': 'Bearer fake-jwt-token' } }
            );
        });
    });

    test('handles request new question button click', async () => {
        render(<Question />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        const requestButton = screen.getByText('Request new question');
        fireEvent.click(requestButton);

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(mockGameContext.setGameEnded).toHaveBeenCalledWith(true);
    });

    test('shows timer in red when time is running low', async () => {
        render(<Question />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        act(() => {
            jest.advanceTimersByTime(50000);
        });

        expect(screen.getByText('00:10')).toBeInTheDocument();

        const circularProgress = document.querySelector('.MuiCircularProgress-colorError');
        expect(circularProgress).toBeInTheDocument();
    });

    test('handles error when fetching question', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network error'));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<Question />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
        consoleErrorSpy.mockRestore();
    });

    test('handles error when checking answer', async () => {
        axios.post.mockRejectedValueOnce(new Error('Network error'));

        jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<Question />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        const images = screen.getAllByRole('img');
        fireEvent.click(images[0].closest('button'));

        await waitFor(() => {
            expect(console.error).toHaveBeenCalled();
        });
        console.error.mockRestore();
    });
});