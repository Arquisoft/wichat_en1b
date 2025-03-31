const request = require('supertest');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./user-model');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  app = require('./user-service'); 
});

beforeEach(async () => {
  process.env.JWT_SECRET = '';
});

afterAll(async () => {
    app.close();
    await mongoServer.stop();
});

describe('User Service', () => {
  it('Should add a new user on POST /adduser with valid data', async () => {
    let newUser = {
      username: 'testuser',
      password: 'testpassword'
    };

    process.env.JWT_SECRET = 'testsecret';

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');

    // Check if the user is inserted into the database
    const userInDb = await User.findOne({ username: 'testuser' });

    // Assert that the user exists in the database
    expect(userInDb).not.toBeNull();
    expect(userInDb.username).toBe('testuser');

    // Assert that the password is encrypted
    const isPasswordValid = await bcrypt.compare('testpassword', userInDb.passwordHash);
    expect(isPasswordValid).toBe(true);
  });

  it('Should throw a 400 status code if some field is missing', async () => {
    let newUser = {
      username: 'testuser',
    };

    process.env.JWT_SECRET = 'testsecret';

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0]).toHaveProperty("msg", "The password is required");
  });

  it('Should throw a 500 status code if some internal error occurs (f.i. missing JWT_SECRET)', async () => {
    const newUser = {
      username: 'testuser',
      password: 'testpassword'
    };

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "secretOrPrivateKey must have a value");
  });
});
