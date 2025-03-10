const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const User = require('./statistics-model');

let mongoServer;
let app;

// Test user data
const testUser = {
  username: 'testuser',
  password: 'testpassword',
};

async function addUser(user) {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const newUser = new User({
    username: user.username,
    passwordHash: hashedPassword,
  });
  await newUser.save();
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  app = require('./statistics-service'); 
  // Load database with initial conditions
  await addUser(testUser);
});

afterAll(async () => {
  app.close();
  await mongoServer.stop();
});

describe('Statistics Service', () => {
  it('Should retrieve the statistics for user "testuser"', async () => {
    const response = await request(app).get('/statistics/testuser');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('gamesPlayed', 0);
    expect(response.body).toHaveProperty('correctAnswers', 0);
    expect(response.body).toHaveProperty('incorrectAnswers', 0);
  });

  it('Should return 404 for a non-existent user', async () => {
    const response = await request(app).get('/statistics/invaliduser');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('Should update statistics for user "testuser"', async () => {
    const updateData = {
      gamesPlayed: 1,
      correctAnswers: 2,
      incorrectAnswers: 1
    };

    const response = await request(app)
      .post('/statistics/testuser/update')
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.gamesPlayed).toBe(1);
    expect(response.body.correctAnswers).toBe(2);
    expect(response.body.incorrectAnswers).toBe(1);

    // Verify the update via the GET endpoint
    const getResponse = await request(app).get('/statistics/testuser');
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.gamesPlayed).toBe(1);
    expect(getResponse.body.correctAnswers).toBe(2);
    expect(getResponse.body.incorrectAnswers).toBe(1);
  });

  it('Should return 404 when updating a non-existent user', async () => {
    const updateData = {
      gamesPlayed: 1,
    };
    const response = await request(app)
      .post('/statistics/nonexistent/update')
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });
});
