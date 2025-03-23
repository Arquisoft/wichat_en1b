const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user-model');

let mongoServer;
let server;
let app;
let token;

// Test user details
const testUser = {
  username: 'testuser',
  password: 'testpassword',
};

// Generate JWT token
function generateToken(username) {
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Start the MongoDB Memory Server
beforeAll(async () => {
  jest.setTimeout(60000); // Set timeout for the entire suite
  process.env.JWT_SECRET = 'testsecret';

  try {
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log('MongoDB Memory Server URI:', mongoUri);

    // Disconnect any existing connections
    await mongoose.disconnect();
    mongoose.connection.removeAllListeners();

    // Connect to MongoDB with explicit options
    await mongoose.connect(mongoUri, {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10, // Increase pool size for better handling
    });
    console.log(`Connected to MongoDB directly with status: ${mongoose.connection.readyState}`);

    // Import the app
    const { app: statisticsApp } = require('./statistics-service');
    app = statisticsApp;

    // Start the server
    server = app.listen(0);

    // Setup test data
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await User.deleteMany({}); // Clear existing users
    const user = new User({
      username: testUser.username,
      passwordHash: hashedPassword,
      gamesPlayed: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
    });
    await user.save();
    console.log(`Test user created with ID: ${user._id}`);

    // Generate token
    token = generateToken(testUser.username);
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
}, 60000);

// Clean up resources
afterAll(async () => {
  try {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
    
    if (mongoose.connection) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});

// Reset user stats before each test
beforeEach(async () => {
  try {
    await User.updateOne(
      { username: testUser.username },
      {
        $set: {
          gamesPlayed: 0,
          questionsAnswered: 0,
          correctAnswers: 0,
          incorrectAnswers: 0
        }
      }
    );
  } catch (error) {
    console.error('Error resetting user stats:', error);
  }
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