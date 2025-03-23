const request = require('supertest');
const axios = require('axios');

const app = require('./llm-service'); 

beforeEach(() => {
    process.env.LLM_API_KEY = 'test-api-key';
});

afterAll(async () => {
    app.close();
});

jest.mock('axios');

describe('LLM Service', () => {
    // Mock responses from external services
    axios.post.mockImplementation((url, data) => {
        return Promise.resolve({ data: { choices: [ { message: { content: "llmanswer"  } } ] } });
    });

    // Test /ask endpoint
    it('A valid LLM POST request', async () => {
        const response = await request(app)
        .post('/ask')
        .send({ gameQuestion: 'Which of the following flags belongs to Switzerland?', userQuestion: "Which is this flag's main color?" });

        expect(response.statusCode).toBe(200);
        expect(response.body.answer).toBe('llmanswer');
    });

    it('An invalid LLM POST request, gameQuestion is missing', async () => {
        const response = await request(app)
        .post('/ask')
        .send({ userQuestion: "Which is this flag's main color?" });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors[0].msg).toBe('Question is required');
    });

    it('An invalid LLM POST request, userQuestion is missing', async () => {
        const response = await request(app)
        .post('/ask')
        .send({ gameQuestion: 'Which of the following flags belongs to Switzerland?' });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors[0].msg).toBe('The user question is required');
    });

    it('An invalid LLM POST request, LLM API key is missing', async () => {
        process.env.LLM_API_KEY = '';
        const response = await request(app)
        .post('/ask')
        .send({ gameQuestion: 'Which of the following flags belongs to Switzerland?', userQuestion: "Which is this flag's main color?" });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('API key is missing.');
    });
});