const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service');
const jwt = require('jsonwebtoken');
const FormData = require('form-data');

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
    if (url.endsWith('/login')) {
      return Promise.resolve({ data: { token: 'mockedToken' } });
    } else if (url.endsWith('/adduser')) {
      return Promise.resolve({ data: { userId: 'mockedUserId' } });
    } else if (url.endsWith('/ask')) {
      return Promise.resolve({ data: { answer: 'llmanswer' } });
    } else if (url.endsWith('/simpleMessage')) {
      return Promise.resolve({ data: { answer: 'simple llmanswer' } });
    } else if (url.endsWith('/answer')) {
      return Promise.resolve({ data: { correct: true } });
    } else if (url.endsWith('/users/someuser/default-image')) {
      return Promise.resolve({ data: { success: true, message: 'Image updated successfully', imagePath: '/images/default/image_1.png' } });
    } else if (url.includes('/users/') && url.endsWith('/custom-image')) {
      if (data instanceof FormData && data.getBuffer()) {
        return Promise.resolve({
          data: { success: true, message: 'Custom image uploaded successfully', imagePath: '/images/custom/image_1.png' }
        });
      } else {
        return Promise.reject({
          response: {
            status: 400,
            data: { error: 'Invalid image upload' }
          }
        });
      }
    } else {
      return Promise.reject(new Error(`Unhandled POST request to ${url}`));
    }
  });

  // Mock responses for GET requests
  axios.get.mockImplementation((url) => {
    if (url.includes('/statistics') && !url.includes('/statistics/')) {
      return Promise.resolve({
        data: {
          users: [
            {
              username: 'testuser',
              gamesPlayed: 5,
              totalVisits: 10,
              registrationDate: '2023-01-01T12:00:00Z',
              globalStatistics: {
                questionsAnswered: 50,
                correctAnswers: 40,
                incorrectAnswers: 10,
                maxScore: 100,
                gamesPlayed: 5
              }
            }
          ],
          pagination: {
            total: 1,
            limit: 50,
            offset: 0,
            hasMore: false
          }
        }
      });
    } else if (url.endsWith('/question') || url.endsWith('/question/flags') || url.endsWith('/question-of-the-day')) {
      return Promise.resolve({
        data: {
          id: "mpzulblyui9du98pmodg5o",
          question: "Which of the following flags belongs to Nepal?",
          images: [
            "http://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20Nepal.svg",
            "http://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20Myanmar.svg",
            "http://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20Costa%20Rica.svg",
            "http://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20Yemen.svg"
          ]
        }
      });
    } else if (url.endsWith('/users/someuser/image')) {
      return Promise.resolve({ data: { image: '/images/default/image_1.png' } });
    } else if (url.endsWith('/images/default/image_1.png')) {
      return Promise.resolve({
        data: new ArrayBuffer(8),
        headers: { 'content-type': 'image/png' }
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
      .send({ gameQuestion: 'question', userQuestion: 'user question' });

    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });

  // Test /statistics GET endpoint with updated implementation
  it('should forward statistics request with query parameters to the statistics service', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Mock specific implementation for this test with query parameters
    axios.get.mockImplementationOnce((url) => {
      // Check if URL contains the expected query parameters
      if (url.includes('/statistics') &&
        url.includes('sort=gamesPlayed') &&
        url.includes('order=desc') &&
        url.includes('limit=10') &&
        url.includes('gameType=classical')) {
        return Promise.resolve({
          data: {
            users: [
              {
                username: 'testuser',
                gamesPlayed: 5,
                globalStatistics: {
                  questionsAnswered: 50,
                  correctAnswers: 40,
                  incorrectAnswers: 10,
                  maxScore: 100,
                  gamesPlayed: 5
                }
              }
            ],
            pagination: {
              total: 1,
              limit: 10,
              offset: 0,
              hasMore: false
            }
          }
        });
      }
      throw new Error(`Mock not matched for URL: ${url}`);
    });

    const response = await request(app)
      .get('/statistics?sort=gamesPlayed&order=desc&limit=10&gameType=classical')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.users).toBeInstanceOf(Array);
    expect(response.body.users[0].username).toBe('testuser');
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.limit).toBe(10);
  }, 15000);

  // Test /statistics GET endpoint with no query parameters
  it('should forward statistics request with no query parameters to the statistics service', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    axios.get.mockImplementationOnce((url) => {
      if (url.endsWith('/statistics')) {
        return Promise.resolve({
          data: {
            users: [
              {
                username: 'testuser',
                gamesPlayed: 5,
                globalStatistics: {
                  gamesPlayed: 5
                }
              }
            ],
            pagination: {
              total: 1,
              limit: 50,
              offset: 0,
              hasMore: false
            }
          }
        });
      }
    });

    const response = await request(app)
      .get('/statistics')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.users).toBeInstanceOf(Array);
    expect(response.body.pagination).toBeDefined();
  }, 15000);

  const verifyMockQuestion = async (endpoint) => {
    const token = jwt.sign({ username: 'someuser' }, process.env.JWT_SECRET, { expiresIn: '1m' });

    const response = await request(app)
      .get(endpoint)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe('mpzulblyui9du98pmodg5o');
    expect(response.body.question).toBe('Which of the following flags belongs to Nepal?');
    expect(response.body.images).toHaveLength(4);
  };

  // Test /question endpoint
  it('should retrieve a question from the question service', async () => {
    await verifyMockQuestion('/question');
  });

  it('should retrieve a question from the question service by specific question type', async () => {
    await verifyMockQuestion('/question/flags');
  });

  it('should retrieve a question from the question of the day', async () => {
    await verifyMockQuestion('/question-of-the-day')
  });

  // Test /answer endpoint
  it('should submit an answer and get a response', async () => {
    const token = jwt.sign({ username: 'someuser' }, process.env.JWT_SECRET, { expiresIn: '1m' });

    const response = await request(app)
      .post('/answer')
      .set('Authorization', `Bearer ${token}`)
      .send({ questionId: '1', answer: 'mockAnswer' });

    expect(response.statusCode).toBe(200);
    expect(response.body.correct).toBe(true);
  });

  it('should retrieve the image of some user', async () => {
    const response = await request(app)
      .get('/users/someuser/image');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Buffer);
    expect(response.headers['content-type']).toBe('image/png; charset=utf-8');
  });

  it('should update the user account successfully', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    axios.patch.mockImplementationOnce((url, data) => {
      if (url.endsWith('/users/testuser') && data.currentUser === 'testuser') {
        return Promise.resolve({ data: { success: true, message: 'Account updated successfully' } });
      }
    });

    const response = await request(app)
      .patch('/users/testuser')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'newusername', password: 'newpassword', passwordRepeat: 'newpassword' });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Account updated successfully');
  });

  it('should retrieve some default image', async () => {
    const response = await request(app)
      .get('/default-images/image_1.png');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Buffer);
    expect(response.headers['content-type']).toBe('image/png; charset=utf-8');
  });

  it('should update the image of some user, to a default one', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    let token = jwt.sign({ username: 'someuser' }, process.env.JWT_SECRET, { expiresIn: '1m' });

    const response = await request(app)
      .post('/users/someuser/default-image')
      .send({ image: 'image_1.png' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Image updated successfully');
    expect(response.body.imagePath).toBe('/images/default/image_1.png');
  });

  it('should update the image of some user, to a custom uploaded one', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'someuser' }, process.env.JWT_SECRET, { expiresIn: '1m' });

    const mockImageBuffer = Buffer.from('mockImageData');
    const mockImageName = 'custom_image.png';

    const response = await request(app)
      .post('/users/someuser/custom-image')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', mockImageBuffer, mockImageName);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Custom image uploaded successfully');
    expect(response.body.imagePath).toBe('/images/custom/image_1.png');
  });

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

  it('should return user statistics for a valid username', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'currentuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    axios.get.mockImplementationOnce((url, { headers }) => {
      if (url.endsWith('/statistics/validuser') && headers.currentuser === 'currentuser') {
        return Promise.resolve({
          data: { gamesPlayed: 10, correctAnswers: 7 }
        });
      }
    });

    const response = await request(app)
      .get('/profile/validuser')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.gamesPlayed).toBe(10);
    expect(response.body.correctAnswers).toBe(7);
  });

  it('should forward recordGame request to the statistics service', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    axios.post.mockImplementationOnce((url, data, { headers }) => {
      if (
        url.endsWith('/recordGame') &&
        headers.username === 'testuser' &&
        data.gameType === 'classical'
      ) {
        return Promise.resolve({ data: { success: true } });
      }
    });

    const response = await request(app)
      .post('/recordGame')
      .set('Authorization', `Bearer ${token}`)
      .send({
        gameType: 'classical',
        score: 100,
        questionsAnswered: 10,
        correctAnswers: 8,
        incorrectAnswers: 2
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
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

  it('should handle errors from simplellm', async () => {
    axios.post.mockImplementationOnce((url) => {
      if (url.endsWith('/simpleMessage')) {
        return getRejectedPromise(500, 'SIMPLE LLM service error');
      }
    });

    const response = await request(app)
      .post('/simplellm')
      .send({ message: 'test' });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('SIMPLE LLM service error');
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

  it('should handle errors from answer endpoint from question service', async () => {
    const token = jwt.sign({ username: 'someuser' }, process.env.JWT_SECRET, { expiresIn: '1m' });

    axios.post.mockImplementationOnce((url) => {
      if (url.endsWith('/answer')) {
        return getRejectedPromise(500, 'Answer service error');
      }
    });

    const response = await request(app)
      .post('/answer')
      .set('Authorization', `Bearer ${token}`)
      .send({ questionId: '1', answer: 'mockAnswer' });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Answer service error');
  });

  /// Test error case for statistics with query parameters
  it('should handle errors from statistics service with query parameters', async () => {
    // Mock the error response from the statistics service
    axios.get.mockImplementationOnce((url) => {
      if (url.includes('/statistics') && url.includes('gameType=invalid')) {
        return getRejectedPromise(400, 'Invalid game type');
      }
    });

    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .get('/statistics?gameType=invalid')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid game type');
  });

  it('should handle errors from the user service', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    axios.patch.mockImplementationOnce(() => getRejectedPromise(400, 'Invalid update data'));

    const response = await request(app)
      .patch('/users/testuser')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'newusername', password: 'newpassword', passwordRepeat: 'newpassword' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid update data');
  });

  it('should return 403 if trying to update another user\'s account', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .patch('/users/otheruser')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'newusername', password: 'newpassword', passwordRepeat: 'newpassword' });

    expect(response.statusCode).toBe(403);
    expect(response.body.error).toBe('You can only update your own account');
  });

  it('should return 400 if no image file is provided', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'someuser' }, process.env.JWT_SECRET, { expiresIn: '1m' });

    const response = await request(app)
      .post('/users/someuser/custom-image')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('No image file provided');
  });

  it('should return 400 if the uploaded file is not an image', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'someuser' }, process.env.JWT_SECRET, { expiresIn: '1m' });

    const mockNonImageBuffer = Buffer.from('mockNonImageData');
    const mockNonImageName = 'not_an_image.txt';

    const response = await request(app)
      .post('/users/someuser/custom-image')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', mockNonImageBuffer, mockNonImageName);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('profile.errors.invalidImage');
  });

  it('should return 401 for missing Authorization header in POST /statistics', async () => {
    const response = await request(app)
      .post('/statistics')
      .send({ userId: 'mockuser', gamesPlayed: 1 });

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('Authorization header missing');
  });

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

  it('should return 400 for an invalid username format', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'currentuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .get('/profile/invalid@username!')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid username format');
  });

  it('should return 400 for invalid username format in /profile/:username', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const invalidUsername = 'invalid@username!';
    const token = jwt.sign({ username: invalidUsername }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .get(`/profile/${invalidUsername}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid username format');
  });

  it('should return 401 for missing Authorization header', async () => {
    const response = await request(app).get('/profile/validuser');

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('Authorization header missing');
  });

  it('should return 400 if no default image is provided', async () => {
    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'someuser' }, process.env.JWT_SECRET, { expiresIn: '1m' });

    const response = await request(app)
      .post('/users/someuser/default-image')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('No default image provided');
  });

  it('should handle errors in /recordGame endpoint', async () => {
    axios.post.mockImplementationOnce(() => getRejectedPromise(400, 'Invalid game data'));

    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .post('/recordGame')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameType: 'invalid' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid game data');
  });
});

describe('Error handling for endpoints', () => {
  it('should handle errors in /login endpoint', async () => {
    axios.post.mockImplementationOnce(() => getRejectedPromise(500, 'Auth service error'));

    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Auth service error');
  });

  it('should handle errors in /adduser endpoint', async () => {
    axios.post.mockImplementationOnce(() => getRejectedPromise(400, 'Invalid user data'));

    const response = await request(app)
      .post('/adduser')
      .send({ username: 'bad_user' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid user data');
  });

  it('should handle errors in /default-images/:imageName endpoint', async () => {
    axios.get.mockImplementationOnce(() => getRejectedPromise(404, 'Image not found'));

    const response = await request(app).get('/default-images/nonexistent.png');

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Image not found');
  });

  it('should handle errors in /users/:username/image endpoint', async () => {
    axios.get.mockImplementationOnce(() => getRejectedPromise(404, 'User image not found'));

    const response = await request(app).get('/users/nonexistent/image');

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('User image not found');
  });

  it('should handle errors in /users/:username/default-image endpoint', async () => {
    axios.post.mockImplementationOnce(() => getRejectedPromise(400, 'Invalid default image'));

    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'someuser' }, process.env.JWT_SECRET, { expiresIn: '1m' });

    const response = await request(app)
      .post('/users/someuser/default-image')
      .set('Authorization', `Bearer ${token}`)
      .send({ image: 'invalid_image.png' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid default image');
  });

  it('should handle errors in /users/:username/custom-image endpoint', async () => {
    axios.post.mockImplementationOnce(() => getRejectedPromise(500, 'Custom image upload failed'));

    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'someuser' }, process.env.JWT_SECRET, { expiresIn: '1m' });

    const mockImageBuffer = Buffer.from('mockImageData');
    const mockImageName = 'custom_image.png';

    const response = await request(app)
      .post('/users/someuser/custom-image')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', mockImageBuffer, mockImageName);

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Custom image upload failed');
  });

  it('should handle errors in /profile/:username endpoint', async () => {
    axios.get.mockImplementationOnce(() => getRejectedPromise(404, 'User stats not found'));

    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'currentuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .get('/profile/nonexistentuser')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('User stats not found');
  });

  it('should handle errors in /askllm endpoint', async () => {
    axios.post.mockImplementationOnce(() => getRejectedPromise(500, 'LLM service error'));

    const response = await request(app)
      .post('/askllm')
      .send({ question: 'test', apiKey: 'apiKey', model: 'gemini' });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('LLM service error');
  });

  it('should handle errors in /question endpoint', async () => {
    axios.get.mockImplementationOnce(() => getRejectedPromise(500, 'Question service error'));

    const response = await request(app).get('/question');

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Question service error');
  });

  it('should handle errors in /question/:questionType endpoint', async () => {
    axios.get.mockImplementationOnce(() => getRejectedPromise(404, 'Question type not found'));

    const response = await request(app).get('/question/invalidType');

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Question type not found');
  });

  it('should handle errors in /answer endpoint', async () => {
    const token = jwt.sign({ username: 'someuser' }, process.env.JWT_SECRET, { expiresIn: '1m' });

    axios.post.mockImplementationOnce(() => getRejectedPromise(500, 'Answer validation failed'));

    const response = await request(app)
      .post('/answer')
      .set('Authorization', `Bearer ${token}`)
      .send({ questionId: '1', answer: 'wrongAnswer' });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Answer validation failed');
  });

  it('should handle errors in /statistics GET endpoint', async () => {
    axios.get.mockImplementationOnce(() => getRejectedPromise(404, 'Statistics not found'));

    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'nonexistent' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .get('/statistics')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Statistics not found');
  });

  it('should handle errors in /statistics POST endpoint', async () => {
    axios.post.mockImplementationOnce(() => getRejectedPromise(500, 'Statistics update failed'));

    process.env.JWT_SECRET = 'mocksecret';
    const token = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .post('/statistics')
      .set('Authorization', `Bearer ${token}`)
      .send({ gamesPlayed: 1 });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Statistics update failed');
  });
});