process.env.LLM_API_KEY = 'test-empathy-api-key';
process.env.GEMINI_API_KEY = 'test-gemini-api-key';

jest.mock('express', () => {
    const actualExpress = jest.requireActual('express');
    const app = actualExpress();
    app.listen = jest.fn(() => app); // Prevent binding to a port
    const mockedExpress = () => app;
    Object.assign(mockedExpress, actualExpress);
    return mockedExpress;
});

// Mock the controllers
jest.mock('./controllers/EmpathyController', () => {
    return jest.fn().mockImplementation(() => ({
        hasApiKey: jest.fn().mockReturnValue(true),
        sendQuestionToLLM: jest.fn().mockResolvedValue('empathy llmanswer'),
        sendSimpleMessageToLLM: jest.fn().mockResolvedValue('empathy simple response'),
    }));
});

jest.mock('./controllers/GeminiController', () => {
    return jest.fn().mockImplementation(() => ({
        hasApiKey: jest.fn().mockReturnValue(true),
        sendQuestionToLLM: jest.fn().mockResolvedValue('gemini llmanswer'),
        sendSimpleMessageToLLM: jest.fn().mockResolvedValue('gemini simple response'),
    }));
});

const request = require('supertest');
const axios = require('axios');

const app = require('./llm-service');
jest.mock('axios');

describe('LLM Service', () => {

    beforeEach(() => {
        axios.post.mockImplementation((url) => {
            if (url.includes('empathyai.prod.empathy.co')) {
                return Promise.resolve({ data: { choices: [{ message: { content: 'empathy llmanswer' } }] } });
            }
            if (url.includes('generativelanguage.googleapis.com')) {
                return Promise.resolve({ data: { candidates: [{ content: { parts: [{ text: 'gemini llmanswer' }] } }] } });
            }
            return Promise.reject(new Error('Unknown URL'));
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const successfullLLMResponseExpect = async (path, expectedAnswer) => {
        const response = await request(app)
            .post(path)
            .send({ gameQuestion: 'Which of the following flags belongs to Switzerland?', userQuestion: "Which is this flag's main color?" });
        expect(response.statusCode).toBe(200);
        expect(response.body.answer).toContain(expectedAnswer);
    };

    it('POST /ask returns a valid response', async () => {
        await successfullLLMResponseExpect('/ask', 'llmanswer');
    });

    it('POST /ask/gemini returns gemini response', async () => {
        await successfullLLMResponseExpect('/ask/gemini', 'gemini llmanswer');
    });

    it('POST /ask/empathy returns empathy response', async () => {
        await successfullLLMResponseExpect('/ask/empathy', 'empathy llmanswer');
    });

    it('POST /ask missing gameQuestion returns 400', async () => {
        const res = await request(app)
            .post('/ask')
            .send({ userQuestion: 'Color?' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].msg).toBe('The game question is required');
    });

    it('POST /ask missing userQuestion returns 400', async () => {
        const res = await request(app)
            .post('/ask')
            .send({ gameQuestion: 'What flag?' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].msg).toBe('The user question is required');
    });

    const validSimpleMessage = async (path) => {
        const res = await request(app)
            .post(path)
            .send({ message: 'Hello' });
        expect(res.statusCode).toBe(200);
    };

    it('POST /simpleMessage is valid', async () => {
        await validSimpleMessage('/simpleMessage');
    });

    it('POST /simpleMessage/gemini is valid', async () => {
        await validSimpleMessage('/simpleMessage/gemini');
    });

    it('POST /simpleMessage/empathy is valid', async () => {
        await validSimpleMessage('/simpleMessage/empathy');
    });

    it('POST /simpleMessage missing message returns 400', async () => {
        const res = await request(app)
            .post('/simpleMessage')
            .send({});
        expect(res.statusCode).toBe(400);
    });
});

describe('LLM Service Error Handling', () => {
    let EmpathyController, GeminiController;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        jest.resetModules();

        // Import mocked controllers
        EmpathyController = require('./controllers/EmpathyController');
        GeminiController = require('./controllers/GeminiController');
    });

    it('should handle controller fallback when a request fails', async () => {
        // Clear previous mocks
        jest.clearAllMocks();
    
        // Mock GeminiController to fail
        const mockGeminiController = {
            hasApiKey: jest.fn().mockReturnValue(true),
            sendQuestionToLLM: jest.fn().mockRejectedValueOnce(new Error('Primary controller failed')),
            sendSimpleMessageToLLM: jest.fn().mockResolvedValue('gemini simple response'),
        };
    
        // Mock EmpathyController to succeed
        const mockEmpathyController = {
            hasApiKey: jest.fn().mockReturnValue(true),
            sendQuestionToLLM: jest.fn().mockResolvedValue('fallback controller answer'),
            sendSimpleMessageToLLM: jest.fn().mockResolvedValue('empathy simple response'),
        };
    
        // Mock the controllers
        jest.doMock('./controllers/GeminiController', () => {
            return jest.fn().mockImplementation(() => mockGeminiController);
        });
        jest.doMock('./controllers/EmpathyController', () => {
            return jest.fn().mockImplementation(() => mockEmpathyController);
        });
    
        // Reset modules to apply new mocks
        jest.resetModules();
        const app = require('./llm-service');
    
        const response = await request(app)
            .post('/ask')
            .send({
                gameQuestion: 'Which of the following flags belongs to Switzerland?',
                userQuestion: "Which is this flag's main color?",
            });
    
        expect(mockGeminiController.sendQuestionToLLM).toHaveBeenCalledTimes(1);
        expect(mockEmpathyController.sendQuestionToLLM).toHaveBeenCalledTimes(1);
        expect(response.statusCode).toBe(200);
        expect(response.body.answer).toBe('fallback controller answer');
    });


    it('Returns 500 when all controllers fail', async () => {
        // Clear previous mocks
        jest.clearAllMocks();
    
        // Mock both controllers to fail
        const mockGeminiController = {
            hasApiKey: jest.fn().mockReturnValue(true),
            sendQuestionToLLM: jest.fn().mockRejectedValue(new Error('Gemini failed')),
            sendSimpleMessageToLLM: jest.fn().mockResolvedValue('gemini simple response'),
        };
    
        const mockEmpathyController = {
            hasApiKey: jest.fn().mockReturnValue(true),
            sendQuestionToLLM: jest.fn().mockRejectedValue(new Error('Empathy failed')),
            sendSimpleMessageToLLM: jest.fn().mockResolvedValue('empathy simple response'),
        };
    
        jest.doMock('./controllers/GeminiController', () => {
            return jest.fn().mockImplementation(() => mockGeminiController);
        });
        jest.doMock('./controllers/EmpathyController', () => {
            return jest.fn().mockImplementation(() => mockEmpathyController);
        });
    
        // Reset modules to apply new mocks
        jest.resetModules();
        const app = require('./llm-service');
    
        const res = await request(app)
            .post('/ask')
            .send({
                gameQuestion: 'Which of the following flags belongs to Switzerland?',
                userQuestion: "Which is this flag's main color?",
            });
    
        expect(mockGeminiController.sendQuestionToLLM).toHaveBeenCalledTimes(1);
        expect(mockEmpathyController.sendQuestionToLLM).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('An error occurred while processing the request.');
    });

    it('Returns 500 if Gemini API key is missing', async () => {
        jest.doMock('./controllers/GeminiController', () => {
            return jest.fn().mockImplementation(() => ({
                hasApiKey: () => false,
                sendQuestionToLLM: jest.fn()
            }));
        });

        jest.resetModules();
        const tempApp = require('./llm-service');

        const res = await request(tempApp)
            .post('/ask/gemini')
            .send({
                gameQuestion: 'test',
                userQuestion: 'test'
            });

        expect(res.statusCode).toBe(500);

        jest.dontMock('./controllers/GeminiController');
    });

    it('Returns 500 if Empathy API key is missing', async () => {
        jest.doMock('./controllers/EmpathyController', () => {
            return jest.fn().mockImplementation(() => ({
                hasApiKey: () => false,
                sendQuestionToLLM: jest.fn()
            }));
        });

        jest.resetModules();
        const tempApp = require('./llm-service');

        const res = await request(tempApp)
            .post('/ask/empathy')
            .send({
                gameQuestion: 'test',
                userQuestion: 'test'
            });

        expect(res.statusCode).toBe(500);

        jest.dontMock('./controllers/EmpathyController');
    });

    it('Returns 500 if no controller has API key for simpleMessage', async () => {
        jest.doMock('./controllers/EmpathyController', () => {
            return jest.fn().mockImplementation(() => ({
                hasApiKey: () => false,
                sendSimpleMessageToLLM: jest.fn()
            }));
        });

        jest.doMock('./controllers/GeminiController', () => {
            return jest.fn().mockImplementation(() => ({
                hasApiKey: () => false,
                sendSimpleMessageToLLM: jest.fn()
            }));
        });

        jest.resetModules();
        const tempApp = require('./llm-service');

        const res = await request(tempApp)
            .post('/simpleMessage')
            .send({ message: 'test' });

        expect(res.statusCode).toBe(500);

        jest.dontMock('./controllers/EmpathyController');
        jest.dontMock('./controllers/GeminiController');
    });

    it('Uses correct controller based on route', async () => {
        // Clear previous mocks
        jest.clearAllMocks();
    
        const mockGeminiController = {
            hasApiKey: jest.fn().mockReturnValue(true),
            sendQuestionToLLM: jest.fn().mockResolvedValue('gemini llmanswer'),
            sendSimpleMessageToLLM: jest.fn().mockResolvedValue('gemini response'),
        };
    
        jest.doMock('./controllers/GeminiController', () => {
            return jest.fn().mockImplementation(() => mockGeminiController);
        });
    
        // Reset modules to apply new mocks
        jest.resetModules();
        const app = require('./llm-service');
    
        const res = await request(app)
            .post('/simpleMessage/gemini')
            .send({ message: 'Hello' });
    
        expect(mockGeminiController.sendSimpleMessageToLLM).toHaveBeenCalledTimes(1);
        expect(mockGeminiController.sendSimpleMessageToLLM).toHaveBeenCalledWith('Hello');
        expect(res.statusCode).toBe(200);
        expect(res.body.response).toBe('gemini response');
    });
});
