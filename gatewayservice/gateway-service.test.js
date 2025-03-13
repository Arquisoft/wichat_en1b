const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service'); 

afterAll(async () => {
    app.close();
  });

jest.mock('axios');

describe('Gateway Service', () => {
  // Mock responses from external services
  axios.post.mockImplementation((url, data) => {
    if (url.endsWith('/login')) {
      return Promise.resolve({ data: { token: 'mockedToken' } });
    } else if (url.endsWith('/adduser')) {
      return Promise.resolve({ data: { userId: 'mockedUserId' } });
    } else if (url.endsWith('/ask')) {
      return Promise.resolve({ data: { answer: 'llmanswer' } });
    }
  });
  
 //Mock GET /statistics response
  axios.get.mockImplementation((url, data) => {
    if (url.endsWith('/statistics/mockuser')) {
      return Promise.resolve({ data: { gamesPlayed: 0, correctAnswers: 0, incorrectAnswers: 0 } });
    }
  });

// Mock GET /question response
axios.get.mockImplementation((url) => {
  if (url.endsWith('/question')) {
    return Promise.resolve({ data: { question: 'mockedQuestion' } });
  }
});

// Mock POST /answer response
axios.post.mockImplementation((url, data) => {
  if (url.endsWith('/answer')) {
    return Promise.resolve({ data: { correct: true } });
  }
});

// Test /health endpoint
it('should return OK status for health check', async () => {
  const response = await request(app).get('/health');
  expect(response.statusCode).toBe(200);
  expect(response.body.status).toBe('OK');
});

  // Test /login endpoint
  it('should forward login request to auth service', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBe('mockedToken');
  });

  // Test /adduser endpoint
  it('should forward add user request to user service', async () => {
    const response = await request(app)
      .post('/adduser')
      .send({ username: 'newuser', password: 'newpassword' });

    expect(response.statusCode).toBe(200);
    expect(response.body.userId).toBe('mockedUserId');
  });

  // Test /askllm endpoint
  it('should forward askllm request to the llm service', async () => {
    const response = await request(app)
      .post('/askllm')
      .send({ question: 'question', apiKey: 'apiKey', model: 'gemini' });

    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });

// Test /question endpoint
it('should retrieve a question from the question service', async () => {
  const response = await request(app).get('/question');
  expect(response.statusCode).toBe(200);
  expect(response.body.question).toBe('mockedQuestion');
});

// Test /answer endpoint
it('should submit an answer and get a response', async () => {
  const response = await request(app)
    .post('/answer')
    .send({ questionId: '1', answer: 'mockAnswer' });

  expect(response.statusCode).toBe(200);
  expect(response.body.correct).toBe(true);
});

  // Test /statistics endpoint
  it('should forward statistics request to the statistics service', async () => {
    const response = await request(app)
      .get('/statistics/mockuser');

    expect(response.statusCode).toBe(200);
    expect(response.body.gamesPlayed).toBe(0);
    expect(response.body.correctAnswers).toBe(0);
    expect(response.body.incorrectAnswers).toBe(0);
  });
});