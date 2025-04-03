// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import { Question } from "./Question";
// import { GameProvider } from "../GameContext";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { act } from "react";
// 
// jest.mock("axios");
// jest.mock("js-cookie", () => ({ get: jest.fn() }));
// 
// // TODO: Fix tests
// describe("Question Component", () => {
//     beforeEach(() => {
//         Cookies.get.mockReturnValue("testUser");
//         axios.get.mockResolvedValue({ data: { question: "Question?", images: ["Image1.jpg", "Image2.jpg"] } });
//         });
//         
//     test("renders the timer correctly", () => {
//         render(
//             <GameProvider>
//                 <Question />
//             </GameProvider>);
//         expect(screen.getByText("01:00")).toBeInTheDocument();
//     });
// 
//     test("fetches and displays a new question on button click", async () => {
//         render(
//             <GameProvider>
//                 <Question />
//             </GameProvider>);
//         const button = screen.getByText(/Request new question/i);
//         fireEvent.click(button);
// 
//         await waitFor(() => expect(axios.get).toHaveBeenCalled());
//     });
// 
//     test("timer countdown works", async () => {
//         jest.useFakeTimers();
//         render(
//             <GameProvider>
//                 <Question />
//             </GameProvider>);
// 
//         await screen.findByText("Question?");
// 
//         await act(async () => {
//             const images = document.querySelectorAll("img");
//             images.forEach((img) => {
//                 img.dispatchEvent(new Event("load")); // Simulate image loading
//             });
//         });
//     
//         // Ensure images are loaded
//         await waitFor(() => expect(screen.queryByText("Loading images...")).not.toBeInTheDocument());        act(() => {
//             jest.advanceTimersByTime(5000); // Fast-forward 5 seconds
//         });
// 
//         expect(screen.getByText("00:55")).toBeInTheDocument();
//         jest.useRealTimers();
//     });
// });

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Question } from './Question';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useGame } from '../GameContext';

// Mock the modules
jest.mock('axios');
jest.mock('js-cookie');
jest.mock('../GameContext', () => ({
    useGame: jest.fn()
}));

// Mock Image constructor for image loading simulation
global.Image = class {
    constructor() {
        setTimeout(() => {
            if (this.onload) this.onload();
        }, 100);
    }
};

describe('Question Component', () => {
    // Sample question data
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

    // Mock game context
    const mockGameContext = {
        question: mockQuestion,
        setQuestion: jest.fn(),
        setGameEnded: jest.fn()
    };

    // Mock user cookie
    const mockUserCookie = JSON.stringify({ token: 'fake-jwt-token' });

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default mock implementations
        useGame.mockReturnValue(mockGameContext);
        Cookies.get.mockImplementation((name) => {
            if (name === 'user') return mockUserCookie;
            return null;
        });

        // Mock environment variables
        process.env.GATEWAY_SERVICE_URL = 'http://test-gateway.com';

        // Mock successful question fetch
        axios.get.mockResolvedValue({ data: mockQuestion });

        // Mock the timer
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders the question and timer', async () => {
        render(<Question />);

        // Wait for images to load
        await waitFor(() => {
            expect(screen.getByText('Which image shows a cat?')).toBeInTheDocument();
        });

        // Check if timer is displayed
        expect(screen.getByText('01:00')).toBeInTheDocument();
    });

    test('fetches a question on initial render', () => {
        render(<Question />);

        // Check if axios.get was called to fetch a question
        expect(axios.get).toHaveBeenCalledWith('http://test-gateway.com/question');
        expect(mockGameContext.setQuestion).toHaveBeenCalled();
    });

    test('loads images and starts timer when question is set', async () => {
        render(<Question />);

        // Wait for images to load
        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        // Check if timer is running
        expect(screen.getByText('01:00')).toBeInTheDocument();

        // Advance timer by 5 seconds
        act(() => {
            jest.advanceTimersByTime(5000);
        });

        // Timer should now show 55 seconds
        expect(screen.getByText('00:55')).toBeInTheDocument();
    });

    test('handles correct answer selection', async () => {
        // Mock correct answer response
        axios.post.mockResolvedValueOnce({ data: { correct: true } });

        render(<Question />);

        // Wait for images to load
        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        // Find and click the first image
        const images = screen.getAllByRole('img');
        fireEvent.click(images[0].closest('button'));

        // Check if answer was submitted correctly
        expect(axios.post).toHaveBeenCalledWith('http://test-gateway.com/answer', {
            questionId: '123',
            answer: 'https://example.com/cat.jpg'
        });

        // Wait for "Correct!" message
        await waitFor(() => {
            expect(screen.getByText('Correct!')).toBeInTheDocument();
        });

        // Timer should be paused
        const initialTime = screen.getByText('01:00').textContent;

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // Time should not change
        expect(screen.getByText(initialTime)).toBeInTheDocument();

        // After 2 seconds, a new question should be requested
        act(() => {
            jest.advanceTimersByTime(2000);
        });

        // Check if a new question was requested
        expect(axios.get).toHaveBeenCalledTimes(2);
    });

    test('handles incorrect answer selection', async () => {
        // Mock incorrect answer response
        axios.post.mockResolvedValueOnce({ data: { correct: false } });

        render(<Question />);

        // Wait for images to load
        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        // Find and click the second image
        const images = screen.getAllByRole('img');
        fireEvent.click(images[1].closest('button'));

        // Wait for "Incorrect" message
        await waitFor(() => {
            expect(screen.getByText('Incorrect')).toBeInTheDocument();
        });

        // After 2 seconds, a new question should be requested
        act(() => {
            jest.advanceTimersByTime(2000);
        });

        // Check if a new question was requested
        expect(axios.get).toHaveBeenCalledTimes(2);
    });

    test('handles time running out', async () => {
        render(<Question />);

        // Wait for images to load
        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        // Advance timer to 0
        act(() => {
            jest.advanceTimersByTime(60000);
        });

        // Check for "You ran out of time!" message
        expect(screen.getByText('You ran out of time!')).toBeInTheDocument();

        // After 2 seconds, a new question should be requested
        act(() => {
            jest.advanceTimersByTime(2000);
        });

        // Check if a new question was requested
        expect(axios.get).toHaveBeenCalledTimes(2);
    });

    test('updates statistics when logged in user answers correctly', async () => {
        // Mock correct answer response
        axios.post.mockImplementation((url) => {
            if (url === 'http://test-gateway.com/answer') {
                return Promise.resolve({ data: { correct: true } });
            }
            return Promise.resolve({ data: {} });
        });

        render(<Question />);

        // Wait for images to load
        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        // Find and click the first image
        const images = screen.getAllByRole('img');
        fireEvent.click(images[0].closest('button'));

        // Check if statistics were updated
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:8005/statistics',
                { questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 },
                { headers: { 'Authorization': 'Bearer fake-jwt-token' } }
            );
        });
    });

    test('updates statistics when logged in user answers incorrectly', async () => {
        // Mock incorrect answer response
        axios.post.mockImplementation((url) => {
            if (url === 'http://test-gateway.com/answer') {
                return Promise.resolve({ data: { correct: false } });
            }
            return Promise.resolve({ data: {} });
        });

        render(<Question />);

        // Wait for images to load
        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        // Find and click the second image
        const images = screen.getAllByRole('img');
        fireEvent.click(images[1].closest('button'));

        // Check if statistics were updated
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

        // Wait for images to load
        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        // Find and click the "Request new question" button
        const requestButton = screen.getByText('Request new question');
        fireEvent.click(requestButton);

        // Check if a new question was requested
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(mockGameContext.setGameEnded).toHaveBeenCalledWith(true);
    });

    test('shows timer in red when time is running low', async () => {
        render(<Question />);

        // Wait for images to load
        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        // Advance timer to 50 seconds (10 seconds left)
        act(() => {
            jest.advanceTimersByTime(50000);
        });

        // Check if timer shows 10 seconds
        expect(screen.getByText('00:10')).toBeInTheDocument();

        // The timer container should have a red border now
        // We can't directly check CSS, but we can check if the component has changed
        // by looking for the CircularProgress with color="error"
        const circularProgress = document.querySelector('.MuiCircularProgress-colorError');
        expect(circularProgress).toBeInTheDocument();
    });

    test('handles error when fetching question', async () => {
        // Mock error response for question fetch
        axios.get.mockRejectedValueOnce(new Error('Network error'));

        // Spy on console.error
        jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<Question />);

        // Check if error was logged
        expect(console.error).toHaveBeenCalled();

        // Restore console.error
        console.error.mockRestore();
    });

    test('handles error when checking answer', async () => {
        // Mock error response for answer check
        axios.post.mockRejectedValueOnce(new Error('Network error'));

        // Spy on console.error
        jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<Question />);

        // Wait for images to load
        await waitFor(() => {
            expect(screen.queryByText('Loading images...')).not.toBeInTheDocument();
        });

        // Find and click the first image
        const images = screen.getAllByRole('img');
        fireEvent.click(images[0].closest('button'));

        // Check if error was logged
        await waitFor(() => {
            expect(console.error).toHaveBeenCalled();
        });

        // Restore console.error
        console.error.mockRestore();
    });
});