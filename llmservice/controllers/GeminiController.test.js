const GeminiController = require('./GeminiController');
const axios = require('axios');
const getSystemPrompt = require('../utils/system-prompt');

jest.mock('axios');
jest.mock('../utils/system-prompt');

describe('GeminiController', () => {
    let geminiController;

    beforeEach(() => {
        process.env.GEMINI_API_KEY = 'test-gemini-api-key';
        geminiController = new GeminiController();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return true if API key is set', () => {
        expect(geminiController.hasApiKey()).toBe(true);
    });

    test('should return false if API key is not set', () => {
        delete process.env.GEMINI_API_KEY;
        geminiController = new GeminiController();
        expect(geminiController.hasApiKey()).toBe(false);
    });

    test('should send a question to LLM and return a response', async () => {
        const gameQuestion = 'What is the capital of Spain?';
        const userQuestion = 'Tell me more about Madrid.';
        const mockResponse = { data: { candidates: [{ content: { parts: [{ text: 'Madrid is the capital of Spain.' }] } }] } };

        getSystemPrompt.mockReturnValue('System prompt for game question');
        axios.post.mockResolvedValue(mockResponse);

        const response = await geminiController.sendQuestionToLLM(gameQuestion, userQuestion);

        expect(getSystemPrompt).toHaveBeenCalledWith(gameQuestion);
        expect(axios.post).toHaveBeenCalledWith(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=test-gemini-api-key',
            {
                contents: [
                    {
                        role: 'model',
                        parts: [
                            { text: 'System prompt for game question' }
                        ]
                    },
                    {
                        role: 'user',
                        parts: [
                            { text: userQuestion }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.5,
                    responseMimeType: 'text/plain'
                }
            }
        );
        expect(response).toBe('Madrid is the capital of Spain.');
    });

    test('should send a simple message to LLM and return a response', async () => {
        const message = 'Hello, Gemini!';
        const mockResponse = { data: { candidates: [{ content: { parts: [{ text: 'Hello, user!' }] } }] } };

        axios.post.mockResolvedValue(mockResponse);

        const response = await geminiController.sendSimpleMessageToLLM(message);

        expect(axios.post).toHaveBeenCalledWith(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=test-gemini-api-key',
            {
                contents: [
                    {
                        role: 'model',
                        parts: [
                            { text: message }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.5,
                    responseMimeType: 'text/plain'
                }
            }
        );
        expect(response).toBe('Hello, user!');
    });

    test('should handle API errors gracefully', async () => {
        const message = 'This will fail';

        axios.post.mockRejectedValue(new Error('API error'));

        const response = await geminiController.sendSimpleMessageToLLM(message);

        expect(axios.post).toHaveBeenCalled();
        expect(response).toBeUndefined();
    });
});