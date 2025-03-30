const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('./statistics-model');
const mongoose = require('mongoose');

let mongoServer;
let app;
let token;

const testUser = {
  username: 'testuser',
  passwordHash: 'hashedpassword', // Required by your model
};

function generateToken(username) {
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';

  // Set up MongoMemoryServer
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;

  // Import statistics service
  app = require('./statistics-service');

  // Set up test user
  await User.deleteMany({});
  const user = new User({
    username: testUser.username,
    passwordHash: testUser.passwordHash,
    gamesPlayed: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
  });
  await user.save();

  token = generateToken(testUser.username);
});

afterAll(async () => {
  if (app && app.listening) {
    await new Promise((resolve) => app.close(resolve));
  }
  await mongoose.connection.close(); // Close Mongoose connection
  if (mongoServer) {
    await mongoServer.stop(); // Stop MongoMemoryServer
  }
});

beforeEach(async () => {
  await User.updateOne(
    { username: testUser.username },
    {
      $set: {
        gamesPlayed: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
      },
    }
  );
});

describe('Statistics Service', () => {
  
  it('Should retrieve statistics for authenticated user', async () => {
    const response = await request(app)
      .get('/statistics')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      gamesPlayed: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
    });
  });

  it('Should return a 401 error for a request without a token', async () => {
    const response = await request(app).get('/statistics');
    
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Authorization header missing');
  });

  it('Should update statistics for authenticated user', async () => {
    const updateData = {
      gamesPlayed: 1,
      questionsAnswered: 5,
      correctAnswers: 3,
      incorrectAnswers: 2,
    };

    const response = await request(app)
      .post('/statistics/update')
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      gamesPlayed: 1,
      questionsAnswered: 5,
      correctAnswers: 3,
      incorrectAnswers: 2,
    });

    // Verify the updated statistics by retrieving them
    const getResponse = await request(app)
      .get('/statistics')
      .set('Authorization', `Bearer ${token}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      gamesPlayed: 1,
      questionsAnswered: 5,
      correctAnswers: 3,
      incorrectAnswers: 2,
    });
  });

  it('Should return a 404 error when updating statistics for a non-existent user', async () => {
    const fakeToken = generateToken('nonexistent');

    const updateData = {
      gamesPlayed: 1,
    };

    const response = await request(app)
      .post('/statistics/update')
      .set('Authorization', `Bearer ${fakeToken}`)
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('Should handle partial updates', async () => {
    const updateData = { gamesPlayed: 2 };

    const response = await request(app)
      .post('/statistics/update')
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      gamesPlayed: 2,
      questionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
    });
  });

  it('Should return a 400 error for invalid input', async () => {
    const updateData = { gamesPlayed: "invalid" };
  
    const response = await request(app)
      .post('/statistics/update')
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);
  
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid input: All statistics must be numbers.');
  });
});
