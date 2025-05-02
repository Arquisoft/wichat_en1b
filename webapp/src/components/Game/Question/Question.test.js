import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
jest.mock('../components/StatisticsUpdater');
jest.mock('../../hooks/useTimer', () => jest.fn(() => ({
    timeLeft: 60,
    isRunning: false,
    start: jest.fn(),
    pause: jest.fn(),
    reset: jest.fn(),
    setInitialTime: jest.fn(),
    initialTime: 60
})));

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

    let timeLeft = 60;

    // Mock StatisticsUpdater instance with jest functions
    const mockStatisticsUpdater = {
        newGame: jest.fn().mockResolvedValue({}),
        endGame: jest.fn().mockResolvedValue({}),
        shouldContinue: jest.fn(),
        incrementGamesPlayed: jest.fn().mockResolvedValue({}),
        recordCorrectAnswer: jest.fn().mockResolvedValue({}),
        recordIncorrectAnswer: jest.fn().mockResolvedValue({})
    };

    const strategy = {
        calculateScore: jest.fn(),
        shouldContinue: jest.fn(),
        statisticsUpdater: mockStatisticsUpdater
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
        setMaxAIAttempts: jest.fn(),
        strategy,
        timeLeft,
        startTimer: jest.fn(() => {
            const interval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft -= 1;
                } else {
                    clearInterval(interval);
                }
            }, 1000);
        }),
        pauseTimer: jest.fn(() => {
            jest.clearAllTimers();
        }),
        resetTimer: jest.fn(() => {
            timeLeft = 60;
        })
    };

    const mockUserCookie = JSON.stringify({ token: 'fake-jwt-token' });

    beforeEach(() => {
        jest.clearAllMocks();

        Cookies.get.mockImplementation((name) => {
            if (name === 'user') return mockUserCookie;
            return null;
        });

        process.env.REACT_APP_API_ENDPOINT = 'http://test-gateway.com';

        axios.get.mockResolvedValue({ data: mockQuestion });

        jest.useFakeTimers();

        // Reset the mock statistics updater methods
        mockStatisticsUpdater.incrementGamesPlayed.mockClear();
        mockStatisticsUpdater.recordCorrectAnswer.mockClear();
        mockStatisticsUpdater.recordIncorrectAnswer.mockClear();

        useGame.mockReturnValue(mockGameContext);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders the question and timer', async () => {
        render(<Question statisticsUpdater={mockStatisticsUpdater} />);

        await waitFor(() => {
            expect(screen.getByText('Which image shows a cat?')).toBeInTheDocument();
        });

        expect(screen.getByText('01:00')).toBeInTheDocument();
    });

    test('fetches a question on initial render', async () => {
        render(<Question statisticsUpdater={mockStatisticsUpdater} />);

        expect(axios.get).toHaveBeenCalledWith('http://test-gateway.com/question/random', {
            headers: {
                Authorization: 'Bearer fake-jwt-token'
            }
        });

        await waitFor(() => {
            expect(mockGameContext.setQuestion).toHaveBeenCalled();
        });
    });

    test('handles correct answer selection', async () => {
        axios.post.mockResolvedValueOnce({ data: { correct: true } });

        render(<Question statisticsUpdater={mockStatisticsUpdater} />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        const images = screen.getAllByRole('img');
        fireEvent.click(images[0].closest('button'));

        expect(axios.post).toHaveBeenCalledWith('http://test-gateway.com/answer', {
            answer: 'https://example.com/cat.jpg',
            questionId: '123',
        }, {
            headers: {
                Authorization: 'Bearer fake-jwt-token'
            }
        });

        await waitFor(() => {
            expect(mockGameContext.strategy.statisticsUpdater.recordCorrectAnswer).toHaveBeenCalled();
        });
    });
    
    test('handles incorrect answer selection', async () => {
        axios.post.mockResolvedValueOnce({ data: { correct: false } });

        render(<Question statisticsUpdater={mockStatisticsUpdater} />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        const images = screen.getAllByRole('img');
        fireEvent.click(images[1].closest('button'));

        expect(axios.post).toHaveBeenCalledWith('http://test-gateway.com/answer', {
            questionId: '123',
            answer: 'https://example.com/dog.jpg',
        }, {
            headers: {
                Authorization: 'Bearer fake-jwt-token'
            }
        });

        await waitFor(() => {
            expect(strategy.statisticsUpdater.recordIncorrectAnswer).toHaveBeenCalled();
        });
    });

    test('handles time running out', async () => {
        const mockHandleTimeUp = jest.fn();
        useGame.mockReturnValue({
            ...mockGameContext,
            handleTimeUp: mockHandleTimeUp,
            timeLeft: 0
        });

        render(<Question statisticsUpdater={mockStatisticsUpdater} />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });
        

        expect(screen.getByText("Time's up!")).toBeInTheDocument();

        expect(axios.get).toHaveBeenCalledTimes(1);
    });

    test('updates statistics when logged in user answers correctly', async () => {
        axios.post.mockImplementation((url) => {
            if (url === 'http://test-gateway.com/answer') {
                return Promise.resolve({ data: { correct: true } });
            }
            return Promise.resolve({ data: {} });
        });

        render(<Question statisticsUpdater={mockStatisticsUpdater} />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        const images = screen.getAllByRole('img');
        fireEvent.click(images[0].closest('button'));

        await waitFor(() => {
            expect(mockStatisticsUpdater.recordCorrectAnswer).toHaveBeenCalled();
        });
    });
    
    test('updates statistics when logged in user answers incorrectly', async () => {
        axios.post.mockImplementation((url) => {
            if (url === 'http://test-gateway.com/answer') {
                return Promise.resolve({ data: { correct: false } });
            }
            return Promise.resolve({ data: {} });
        });

        render(<Question statisticsUpdater={mockStatisticsUpdater} />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        const images = screen.getAllByRole('img');
        fireEvent.click(images[1].closest('button'));

        await waitFor(() => {
            expect(strategy.statisticsUpdater.recordIncorrectAnswer).toHaveBeenCalled();
        });
    });

    test('shows timer in red when time is running low', async () => {
        useGame.mockReturnValue({
            ...mockGameContext,
            timeLeft: 5
        });

        render(<Question statisticsUpdater={mockStatisticsUpdater} />);

        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        const circularProgress = document.querySelector('.MuiCircularProgress-colorError');
        expect(circularProgress).toBeInTheDocument();
    });

    test('handles error when fetching question', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network error'));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<Question statisticsUpdater={mockStatisticsUpdater} />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
        consoleErrorSpy.mockRestore();
    });

    test('handles error when checking answer', async () => {
        axios.post.mockRejectedValueOnce(new Error('Network error'));

        jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<Question statisticsUpdater={mockStatisticsUpdater} />);

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