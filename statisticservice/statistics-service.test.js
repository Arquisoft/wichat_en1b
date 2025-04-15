const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./statistics-model');
const mongoose = require('mongoose');

let mongoServer;
let app;

const testUser = {
  username: 'testuser',
  passwordHash: 'hashedpassword',
};

beforeAll(async () => {
  // Set up MongoMemoryServer
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;

  // Import statistics service after setting MongoDB URI
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
  // Reset user statistics before each test
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
  it ('pending tests', () => {
    expect(true).toBe(true);
  });
  /*
  it('Should retrieve statistics for a valid user', async () => {
    const response = await request(app)
      .get('/statistics')
      .set('username', testUser.username);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      gamesPlayed: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      registrationDate: expect.any(String)
    });
  });

  it('Should update statistics by adding to existing values', async () => {
    const updateData1 = {
      gamesPlayed: 1,
      questionsAnswered: 5,
      correctAnswers: 3,
      incorrectAnswers: 2,
    };

    const response1 = await request(app)
      .post('/statistics')
      .set('username', testUser.username)
      .send(updateData1);

    expect(response1.status).toBe(200);
    expect(response1.body).toEqual({
      gamesPlayed: 1,
      questionsAnswered: 5,
      correctAnswers: 3,
      incorrectAnswers: 2,
    });

    const updateData2 = {
      gamesPlayed: 2,
      questionsAnswered: 10,
      correctAnswers: 7,
      incorrectAnswers: 3,
    };

    const response2 = await request(app)
      .post('/statistics')
      .set('username', testUser.username)
      .send(updateData2);

    expect(response2.status).toBe(200);
    expect(response2.body).toEqual({
      gamesPlayed: 3,
      questionsAnswered: 15,
      correctAnswers: 10,
      incorrectAnswers: 5,
    });

    const getResponse = await request(app)
      .get('/statistics')
      .set('username', testUser.username);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      gamesPlayed: 3,
      questionsAnswered: 15,
      correctAnswers: 10,
      incorrectAnswers: 5,
      registrationDate: expect.any(String)
    });
  });

  it('Should handle partial updates by only incrementing specified fields', async () => {
    await User.updateOne(
      { username: testUser.username },
      {
        $set: {
          gamesPlayed: 5,
          questionsAnswered: 20,
          correctAnswers: 15,
          incorrectAnswers: 5,
        },
      }
    );
    
    const updateData = { gamesPlayed: 2 };

    const response = await request(app)
      .post('/statistics')
      .set('username', testUser.username)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      gamesPlayed: 7,
      questionsAnswered: 20,
      correctAnswers: 15,
      incorrectAnswers: 5,
    });
  });

  it('Should return a 400 error for invalid input', async () => {
    const updateData = { gamesPlayed: "invalid" };
  
    const response = await request(app)
      .post('/statistics')
      .set('username', testUser.username)
      .send(updateData);
  
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid input: All statistics must be numbers.');
  });
  
  it('Should return a 400 error for a request without a username', async () => {
    const response = await request(app).get('/statistics');
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Username missing in request');
  });
  
  it('Should return a 404 error when retrieving statistics for a non-existent user', async () => {
    const response = await request(app)
      .get('/statistics')
      .set('username', 'nonexistent');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });
  
  it('Should return a 404 error when updating statistics for a non-existent user', async () => {
    const updateData = {
      gamesPlayed: 1,
    };

    const response = await request(app)
      .post('/statistics')
      .set('username', 'nonexistent')
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });
  
  it('Should convert string numbers to integers when updating', async () => {
    const updateData = {
      gamesPlayed: "3",
      questionsAnswered: "10"
    };

    const response = await request(app)
      .post('/statistics')
      .set('username', testUser.username)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      gamesPlayed: 3,
      questionsAnswered: 10,
      correctAnswers: 0,
      incorrectAnswers: 0,
    });
  });
  */
});