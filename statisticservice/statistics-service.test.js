const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const User = require('./statistics-model');

let mongoServer;
let app;

//test user
const user = {
  username: 'testuser',
  password: 'testpassword',
};

async function addUser(user){
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
  //Load database with initial conditions
  await addUser(user);
});

afterAll(async () => {
  app.close();
  await mongoServer.stop();
});

describe('Statistics Service', () => {
  it('Should reterieve the statistics for user "testuser" /statistics', async () => {
    const response = await request(app).get('/statistics/testuser');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('gamesPlayed', 0);
    expect(response.body).toHaveProperty('correctAnswers', 0);
    expect(response.body).toHaveProperty('incorrectAnswers', 0);
  });
});
