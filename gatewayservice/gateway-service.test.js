const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service');
const jwt = require('jsonwebtoken');

afterAll(async () => {
  app.close();
});

jest.mock('axios');

const TEST_CREDENTIALS = {
  username: process.env.TEST_USER || 'testuser',
  password: process.env.TEST_PASSWORD || 'test-password-123'
};

const getRejectedPromise = (status, error) => {
  return Promise.reject({
    response: {
      status: status,
      data: { error: error }
    }
  });
};

describe('Gateway Service', () => {
  // Mock responses from external services
  axios.post.mockImplementation((url, data) => {
    if (url.endsWith('/login')) { //Mock POST /login response
      return Promise.resolve({ data: { token: 'mockedToken' } });
    } else if (url.endsWith('/adduser')) { //Mock POST /adduser st
      return Promise.resolve({ data: { userId: 'mockedUserId' } });
    } else if (url.endsWith('/ask')) { //Mock POST /ask response
      return Promise.resolve({ data: { answer: 'llmanswer' } });
    } else if (url.endsWith('/answer')) {// Mock POST /answer response
      return Promise.resolve({ data: { correct: true } });
    } else {
      return Promise.reject(new Error(`Unhandled POST request to ${url}`));
    }
  });

  // Mock responses for GET requests
  axios.get.mockImplementation((url) => {
    if (url.endsWith('/statistics')) {
      return Promise.resolve({ data: { gamesPlayed: 0, questionsAnswered: 0, correctAnswers: 0, incorrectAnswers: 0 } });
    } else if (url.endsWith('/question')) {
      return Promise.resolve({ data: { question: 'questionMock' } });
    } else {
      return Promise.reject(new Error(`Unhandled GET request to ${url}`));
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

  // Test /statistics endpoint
  it('should forward statistics request to the statistics service', async () => {
    process.env.JWT_SECRET = 'mocktoken';
    let token = jwt.sign({ userId: 999, username: process.env.JWT_SECRET }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const response = await request(app)
      .get('/statistics')
      .set('Authorization', `${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.gamesPlayed).toBe(0);
    expect(response.body.correctAnswers).toBe(0);
    expect(response.body.incorrectAnswers).toBe(0);
  }, 15000);

  // Test /question endpoint
  it('should retrieve a question from the question service', async () => {
    const response = await request(app)
      .get('/question');
    expect(response.statusCode).toBe(200);
    expect(response.body.question).toBe('questionMock');
  });

  // Test /answer endpoint
  it('should submit an answer and get a response', async () => {
    const response = await request(app)
      .post('/answer')
      .send({ questionId: '1', answer: 'mockAnswer' });

    expect(response.statusCode).toBe(200);
    expect(response.body.correct).toBe(true);
  });
});

describe('Error handling', () => {
  // Test error case for adduser
  it('should handle errors from user service', async () => {
    // Mock the error response
    axios.post.mockImplementationOnce((url) => {
      if (url.endsWith('/adduser')) {
        return Promise.reject({
          response: {
            status: 400,
            data: { error: 'Invalid user data' }
          }
        });
      }
    });

    const response = await request(app)
      .post('/adduser')
      .send({ username: 'bad_user' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid user data');
  });

  it('should handle errors from login endpoint from auth service', async () => {
    axios.post.mockImplementationOnce((url) => {
      if (url.endsWith('/login')) {
        return getRejectedPromise(500, 'Auth service error');
      }
    });

    const response = await request(app)
      .post('/login')
      .send({ 
        username: TEST_CREDENTIALS.username, 
        password: TEST_CREDENTIALS.password 
      });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Auth service error');
  });


  // Test error case for askllm
  it('should handle errors from llm service', async () => {
    axios.post.mockImplementationOnce((url) => {
      if (url.endsWith('/ask')) {
        return getRejectedPromise(500, 'LLM service error');
      }
    });

    const response = await request(app)
      .post('/askllm')
      .send({ question: 'test' });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('LLM service error');
  });

  // Test error case for question
  it('should handle errors from question service', async () => {
    axios.get.mockImplementationOnce((url) => {
      if (url.endsWith('/question')) {
        return getRejectedPromise(500, 'Question service error');
      }
    });

    const response = await request(app)
      .get('/question');

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Question service error');
  });

  it('should handle errors from answer endoint from question service', async () => {
    axios.post.mockImplementationOnce((url) => {
      if (url.endsWith('/answer')) {
        return getRejectedPromise(500, 'Answer service error');
      }
    });

    const response = await request(app)
      .post('/answer')
      .send({ questionId: '1', answer: 'mockAnswer' });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Answer service error');
  });

});