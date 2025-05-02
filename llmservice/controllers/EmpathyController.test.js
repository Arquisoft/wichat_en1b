const EmpathyController = require('./EmpathyController');
const axios = require('axios');
const getSystemPrompt = require('../utils/system-prompt');

jest.mock('axios');
jest.mock('../utils/system-prompt');

describe('EmpathyController', () => {
    let empathyController;

    beforeEach(() => {
        process.env.LLM_API_KEY = 'test-api-key';
        empathyController = new EmpathyController();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return true if API key is set', () => {
        expect(empathyController.hasApiKey()).toBe(true);
    });

    test('should return false if API key is not set', () => {
        delete process.env.LLM_API_KEY;
        empathyController = new EmpathyController();
        expect(empathyController.hasApiKey()).toBe(false);
    });

    test('should send a question to LLM and return a response', async () => {
        const gameQuestion = 'What is the capital of France?';
        const userQuestion = 'Can you tell me more about Paris?';
        const mockResponse = { data: { choices: [{ message: { content: 'Paris is the capital of France.' } }] } };

        getSystemPrompt.mockReturnValue('System prompt for game question');
        axios.post.mockResolvedValue(mockResponse);

        const response = await empathyController.sendQuestionToLLM(gameQuestion, userQuestion);

        expect(getSystemPrompt).toHaveBeenCalledWith(gameQuestion);
        expect(axios.post).toHaveBeenCalledWith(
            'https://empathyai.prod.empathy.co/v1/chat/completions',
            {
                model: 'mistralai/Mistral-7B-Instruct-v0.3',
                messages: [
                    { role: 'system', content: 'System prompt for game question' },
                    { role: 'user', content: userQuestion }
                ]
            },
            {
                headers: {
                    Authorization: 'Bearer test-api-key',
                    'Content-Type': 'application/json'
                }
            }
        );
        expect(response).toBe('Paris is the capital of France.');
    });

    test('should send a simple message to LLM and return a response', async () => {
        const message = 'Hello, how are you?';
        const mockResponse = { data: { choices: [{ message: { content: 'I am fine, thank you!' } }] } };

        axios.post.mockResolvedValue(mockResponse);

        const response = await empathyController.sendSimpleMessageToLLM(message);

        expect(axios.post).toHaveBeenCalledWith(
            'https://empathyai.prod.empathy.co/v1/chat/completions',
            {
                model: 'mistralai/Mistral-7B-Instruct-v0.3',
                messages: [
                    { role: 'user', content: message }
                ]
            },
            {
                headers: {
                    Authorization: 'Bearer test-api-key',
                    'Content-Type': 'application/json'
                }
            }
        );
        expect(response).toBe('I am fine, thank you!');
    });

    test('should handle API errors gracefully', async () => {
        const message = 'This will fail';

        axios.post.mockRejectedValue(new Error('API error'));

        const response = await empathyController.sendSimpleMessageToLLM(message);

        expect(axios.post).toHaveBeenCalled();
        expect(response).toBeUndefined();
    });
});