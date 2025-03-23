const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const mongoose = require('../models/node_modules/mongoose');
const User = require('../models/user-model');

let mongoServer;
let server;
let app;
let token;

const testUser = {
  username: 'testuser',
  password: 'testpassword',
};

function generateToken(username) {
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

beforeAll(async () => {
  jest.setTimeout(60000);
  process.env.JWT_SECRET = 'testsecret';

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  app = require('./statistics-service');

  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  await User.deleteMany({});
  const user = new User({
    username: testUser.username,
    passwordHash: hashedPassword,
    gamesPlayed: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
  });
  await user.save();

  token = generateToken(testUser.username);
}, 60000);

afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
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

// Tests
describe('Statistics Service', () => {
  it('Should retrieve the statistics for the authenticated user', async () => {
    const response = await request(app)
      .get('/statistics')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('gamesPlayed', 0);
    expect(response.body).toHaveProperty('questionsAnswered', 0);
    expect(response.body).toHaveProperty('correctAnswers', 0);
    expect(response.body).toHaveProperty('incorrectAnswers', 0);
  });

  it('Should return 401 for a request without a token', async () => {
    const response = await request(app).get('/statistics');
    
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Authorization header missing');
  });

  it('Should update statistics for the authenticated user', async () => {
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
    expect(response.body.gamesPlayed).toBe(1);
    expect(response.body.questionsAnswered).toBe(5);
    expect(response.body.correctAnswers).toBe(3);
    expect(response.body.incorrectAnswers).toBe(2);

    // Verify with a GET request
    const getResponse = await request(app)
      .get('/statistics')
      .set('Authorization', `Bearer ${token}`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.gamesPlayed).toBe(1);
    expect(getResponse.body.questionsAnswered).toBe(5);
    expect(getResponse.body.correctAnswers).toBe(3);
    expect(getResponse.body.incorrectAnswers).toBe(2);
  });

  it('Should return 404 when updating a non-existent user', async () => {
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
});