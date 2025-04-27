const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const User = require('./auth-model');

require('dotenv').config();

let mongoServer;
let app;

//test users
const validUser = {
  username: 'testuser',
  password: 'testpassword',
};

const invalidUser = {
  username: 'testuser',
  password: 'invalidPassword',
};

const missingFieldsUser = {
  username: 'testuser'
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
  app = require('./auth-service'); 
  //Load database with initial conditions
  await addUser(validUser);
});

beforeEach(async () => {
  process.env.JWT_SECRET = '';
});

afterAll(async () => {
  app.close();
  await mongoServer.stop();
});

describe('Auth Service', () => {
  it('Should perform a login operation /login', async () => { 
    process.env.JWT_SECRET = 'testsecret';
    
    const response = await request(app).post('/login').send(validUser);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');
  });

  it('Should throw a 400 status code if some field is missing', async () => {     
    const response = await request(app).post('/login').send(missingFieldsUser);
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "logIn.errors.missingFields");
  });

  it('Should throw a 401 status code if password is incorrect', async () => { 
    process.env.JWT_SECRET = 'testsecret';
    
    const response = await request(app).post('/login').send(invalidUser);
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'logIn.errors.invalidCredentials');
  });

  it('Should throw a 500 status code if some internal error occurs (f.i. missing JWT_SECRET)', async () => {     
    const response = await request(app).post('/login').send(validUser);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'secretOrPrivateKey must have a value');
  });
});