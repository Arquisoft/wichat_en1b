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
        if (url.startsWith('https://empathyai.prod.empathy.co')) {
            return Promise.resolve({ data: { choices: [{ message: { content: "empathy llmanswer" } }] } });
        }
        if (url.startsWith('https://generativelanguage.googleapis.com')) {
            return Promise.resolve({ data: { candidates: [{ content: { parts: [{ text: "gemini llmanswer" }] } }] } });
        }
        return Promise.reject(new Error('Unknown URL'));
    });

    const successfullLLMResponseExpect = async (path, responseToContain) => {
        const response = await request(app)
            .post(path)
            .send({ gameQuestion: 'Which of the following flags belongs to Switzerland?', userQuestion: "Which is this flag's main color?" });

        expect(response.statusCode).toBe(200);
        expect(response.body.answer).toContain(responseToContain);
    }

    // Test /ask endpoint
    it('A valid LLM POST request', async () => {
        await successfullLLMResponseExpect('/ask', 'llmanswer');
    });

    it('A valid LLM POST request with gemini', async () => {
        await successfullLLMResponseExpect('/ask/gemini', 'gemini llmanswer');
    });

    it('A valid LLM POST request with empathy', async () => {
        await successfullLLMResponseExpect('/ask/empathy', 'empathy llmanswer');
    });

    it('An invalid LLM POST request, gameQuestion is missing', async () => {
        const response = await request(app)
            .post('/ask')
            .send({ userQuestion: "Which is this flag's main color?" });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors[0].msg).toBe('The game question is required');
    });

    it('An invalid LLM POST request, userQuestion is missing', async () => {
        const response = await request(app)
            .post('/ask')
            .send({ gameQuestion: 'Which of the following flags belongs to Switzerland?' });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors[0].msg).toBe('The user question is required');
    });

});