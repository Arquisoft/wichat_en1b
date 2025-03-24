const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const mongoose = require('../../models/node_modules/mongoose');
const User = require('../../models/user-model');

require('dotenv').config();

let mongoServer;
let app;

const testUser = {
  username: 'testuser',
  password: 'testpassword',
};

async function addUser(user) {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const newUser = new User({
    username: user.username,
    passwordHash: hashedPassword,
    registrationDate: new Date(),
  });
  await newUser.save();
}

beforeAll(async () => {
  jest.setTimeout(60000);

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Disconnect any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Connect to MongoMemoryServer
  await mongoose.connect(mongoUri, {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  // Import auth-service after setting up the connection
  const { app: authApp } = require('./auth-service-separate'); // Use a separate file for testing
  app = authApp;

  // Add test user
  await addUser(testUser);
});

afterAll(async () => {
  if (app && app.listening) {
    await new Promise((resolve) => app.close(resolve));
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Auth Service', () => {
  it('Should perform a login operation /login', async () => {
    const response = await request(app)
      .post('/login')
      .send(testUser);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('createdAt');
  });
});