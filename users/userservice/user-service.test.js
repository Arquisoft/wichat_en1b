const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./user-model');
const jwt = require('jsonwebtoken');

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

describe('User Service Validation', () => {
  it('should reject requests with missing username', async () => {
    const incompleteUser = {
      password: 'testpassword'
    };
    
    const response = await request(app).post('/adduser').send(incompleteUser);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Missing required field: username');
  });
  
  it('should reject requests with missing password', async () => {
    const incompleteUser = {
      username: 'testuser2'
    };
    
    const response = await request(app).post('/adduser').send(incompleteUser);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Missing required field: password');
  });
  
  it('should reject usernames that are too short', async () => {
    const invalidUser = {
      username: 'ab',
      password: 'testpassword'
    };
    
    const response = await request(app).post('/adduser').send(invalidUser);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid username');
  });
  
  it('should reject usernames with invalid characters', async () => {
    const invalidUser = {
      username: 'test-user!',
      password: 'testpassword'
    };
    
    const response = await request(app).post('/adduser').send(invalidUser);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid username');
  });
  
  it('should reject duplicate usernames', async () => {
    // Create a user
    await request(app).post('/adduser').send({
      username: 'duplicateuser',
      password: 'testpassword'
    });
    
    // Try to create the same user again
    const response = await request(app).post('/adduser').send({
      username: 'duplicateuser',
      password: 'anotherpassword'
    });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('already in use');
  });
  
  it('should validate and sanitize username for NoSQL injection attempts', async () => {
    const suspiciousUser = {
      username: { $ne: null }, // NoSQL injection attempt
      password: 'testpassword'
    };
    
    const response = await request(app).post('/adduser').send(suspiciousUser);
    
    expect(response.status).toBe(400);
  });
  
  it('should return a valid JWT token for successful registration', async () => {
    process.env.JWT_SECRET = 'testsecret';

    const newUser = {
      username: 'tokenuser',
      password: 'testpassword'
    };
    
    const response = await request(app).post('/adduser').send(newUser);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    
    // Verify token structure if you have jwt.verify available in tests
    const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(decoded).toHaveProperty('username', 'tokenuser');
    expect(decoded).toHaveProperty('userId');
  });
  
  it('should set registration date when creating a new user', async () => {
    process.env.JWT_SECRET = 'testsecret';

    const newUser = {
      username: 'dateuser',
      password: 'testpassword'
    };
    
    const response = await request(app).post('/adduser').send(newUser);
    const userInDb = await User.findOne({ username: 'dateuser' });
    
    expect(userInDb.registrationDate).toBeInstanceOf(Date);
    expect(response.body).toHaveProperty('createdAt');
  });
});

describe('User Service Image Management', () => {
  it('should retrieve the image for some user', async () => {

  });
});
