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
      return Promise.resolve({ data: { gamesPlayed: 0, 
                                       questionsAnswered: 0, 
                                       correctAnswers: 0, 
                                       incorrectAnswers: 0 
                                     }
                            });

    } else if (url.endsWith('/question') || url.endsWith('/question/flags')) {
      return Promise.resolve({ data: { id: "mpzulblyui9du98pmodg5o", 
                                       question: "Which of the following flags belongs to Nepal?",
                                       images: [
                                         "http://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20Nepal.svg",
                                         "http://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20Myanmar.svg",
                                         "http://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20Costa%20Rica.svg",
                                         "http://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20Yemen.svg"
                                       ] 
                                     } 
                            });
    }
      throw new Error(`Unhandled GET request to ${url}`);
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

  // Test /statistics GET endpoint
  it('should forward statistics request to the statistics service', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    axios.get.mockImplementationOnce((url, { headers }) => {
      if (url.endsWith('/statistics') && headers.username === 'testuser') {
        return Promise.resolve({
          data: { gamesPlayed: 5, correctAnswers: 3 }
        });
      }
    });

    const response = await request(app)
      .get('/statistics')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.gamesPlayed).toBe(5);
    expect(response.body.correctAnswers).toBe(3);
  }, 15000);

  // Test /statistics GET endpoint, bad token
  it('should retrieve a 403 error with an invalid token in statistics endpoint', async () => {
    const response = await request(app)
      .get('/statistics')
      .set('Authorization', 'Bearer invalid_token'); // Provide an invalid token
  
    expect(response.statusCode).toBe(403);
    expect(response.body.error).toBe('Invalid or expired token'); // Check correct error message
  });

  // Test /statistics GET endpoint, missing token
  it('should return 401 for missing Authorization header in GET /statistics', async () => {
    const response = await request(app).get('/statistics');
    
    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('Authorization header missing');
  });

  // Test /question endpoint
  it('should retrieve a question from the question service', async () => {
    const response = await request(app)
      .get('/question');

    console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe('mpzulblyui9du98pmodg5o');
    expect(response.body.question).toBe('Which of the following flags belongs to Nepal?');
    expect(response.body.images).toHaveLength(4);
  });

  it('should retrieve a question from the question service by specific question type', async () => {
    const response = await request(app)
      .get('/question/flags');

    console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe('mpzulblyui9du98pmodg5o');
    expect(response.body.question).toBe('Which of the following flags belongs to Nepal?');
    expect(response.body.images).toHaveLength(4);
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

  /// Test error case for statistics
  it('should handle errors from statistics service', async () => {
    // Mock the error response from the statistics service
    axios.get.mockImplementationOnce((url, config) => {
      if (url.endsWith('/statistics')) {
        return getRejectedPromise(404, 'User stats not found');
      }
    });
  
    process.env.JWT_SECRET='mocksecret';
    const username = 'nonexistent';
  
    let token = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
    const response = await request(app)
      .get('/statistics')
      .set('Authorization', `Bearer ${token}`);
  
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('User stats not found');
  });
});

describe('Gateway Service - Additional Tests', () => {
  // Test /statistics POST endpoint
  it('should forward statistics update request to the statistics service', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    axios.post.mockImplementationOnce((url, data, { headers }) => {
      if (
        url.endsWith('/statistics') &&
        headers.username === 'testuser' &&
        data.gamesPlayed === 1
      ) {
        return Promise.resolve({ data: { success: true } });
      }
    });

    const response = await request(app)
      .post('/statistics')
      .set('Authorization', `Bearer ${token}`)
      .send({ gamesPlayed: 1 });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe('Gateway Service - Additional Tests - Error handling', () => {
  
  // Test /statistics POST endpoint, missing token
  it('should return 401 for missing Authorization header in POST /statistics', async () => {

    const response = await request(app)
      .post('/statistics')
      .send({ userId: 'mockuser', gamesPlayed: 1 });

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('Authorization header missing');
  });

});