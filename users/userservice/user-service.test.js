const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./user-model');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

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
  await User.deleteMany({});
});

afterAll(async () => {
    app.close();
    await mongoServer.stop();
});

describe('User Service Validation', () => {
  it('should reject requests with missing username', async () => {
    const incompleteUser = {
      password: 'Testpassword1!'
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
      password: 'Testpassword1!'
    };
    
    const response = await request(app).post('/adduser').send(invalidUser);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid username');
  });
  
  it('should reject usernames with invalid characters', async () => {
    const invalidUser = {
      username: 'test-user!',
      password: 'Testpassword1!'
    };
    
    const response = await request(app).post('/adduser').send(invalidUser);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid username');
  });
  
  it('should reject duplicate usernames', async () => {
    // Create a user
    await request(app).post('/adduser').send({
      username: 'duplicateuser',
      password: 'Testpassword1!'
    });
    
    // Try to create the same user again
    const response = await request(app).post('/adduser').send({
      username: 'duplicateuser',
      password: 'Anotherpassword1!'
    });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('already in use');
  });
  
  it('should validate and sanitize username for NoSQL injection attempts', async () => {
    const suspiciousUser = {
      username: { $ne: null }, // NoSQL injection attempt
      password: 'Testpassword1!'
    };
    
    const response = await request(app).post('/adduser').send(suspiciousUser);
    
    expect(response.status).toBe(400);
  });
  
  it('should return a valid JWT token for successful registration', async () => {
    process.env.JWT_SECRET = 'testsecret';

    const newUser = {
      username: 'tokenuser',
      password: 'Testpassword1!'
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
      password: 'Testpassword1!'
    };
    
    const response = await request(app).post('/adduser').send(newUser);
    const userInDb = await User.findOne({ username: 'dateuser' });
    
    expect(userInDb.registrationDate).toBeInstanceOf(Date);
    expect(response.body).toHaveProperty('createdAt');
  });
});

describe('User Service Image Management', () => {
  it('should retrieve the image for some user', async () => {
    const userWithImage = {
      username: 'imageuser',
      passwordHash: 'hashedpassword',
      image: '/images/custom/image_123.png'
    };
    await User.create(userWithImage);

    const response = await request(app).get('/users/imageuser/image');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('image', '/images/custom/image_123.png');
  });

  it('should return the default image if no image is set for the user', async () => {
    const userWithoutImage = {
      username: 'defaultimageuser',
      passwordHash: 'hashedpassword'
    };
    await User.create(userWithoutImage);

    const response = await request(app).get('/users/defaultimageuser/image');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('image', '/images/default/image_1.png');
  });

  it('should return 404 if the user does not exist', async () => {
    const response = await request(app).get('/users/nonexistentuser/image');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found');
  });
});

describe('User Service Custom Image Upload', () => {
  it('should upload and update the custom image for a user', async () => {
    const user = {
      username: 'customimageuser',
      passwordHash: 'hashedpassword'
    };
    await User.create(user);

    const mockImageBuffer = Buffer.from('mock image data');
    const response = await request(app)
      .post('/users/customimageuser/custom-image')
      .attach('image', mockImageBuffer, 'test-image.png');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Image updated successfully');
    expect(response.body).toHaveProperty('imagePath');
    expect(response.body.imagePath).toMatch(/^\/images\/custom\/customimageuser-\d+\.png$/);

    const userInDb = await User.findOne({ username: 'customimageuser' });
    expect(userInDb.image).toBe(response.body.imagePath);

    const savedImagePath = path.join(__dirname, 'public', userInDb.image);
    expect(fs.existsSync(savedImagePath)).toBe(true);

    // Cleanup
    fs.unlinkSync(savedImagePath);
  });

  it('should return 400 if no image file is provided', async () => {
    const user = {
      username: 'noimageuser',
      passwordHash: 'hashedpassword'
    };
    await User.create(user);

    const response = await request(app).post('/users/noimageuser/custom-image');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'No image file provided');
  });

  it('should return 500 if the user does not exist', async () => {
    const mockImageBuffer = Buffer.from('mock image data');
    const response = await request(app)
      .post('/users/nonexistentuser/custom-image')
      .attach('image', mockImageBuffer, 'test-image.png');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  it('should delete the previous custom image if it exists', async () => {
    const user = {
      username: 'deleteoldimageuser',
      passwordHash: 'hashedpassword',
      image: '/images/custom/old-image.png'
    };
    await User.create(user);

    const oldImagePath = path.join(__dirname, 'public', user.image);
    fs.mkdirSync(path.dirname(oldImagePath), { recursive: true });
    fs.writeFileSync(oldImagePath, 'old image data');

    const mockImageBuffer = Buffer.from('mock image data');
    const response = await request(app)
      .post('/users/deleteoldimageuser/custom-image')
      .attach('image', mockImageBuffer, 'new-image.png');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.imagePath).not.toBe(user.image);

    const userInDb = await User.findOne({ username: 'deleteoldimageuser' });
    expect(userInDb.image).toBe(response.body.imagePath);

    const newImagePath = path.join(__dirname, 'public', userInDb.image);
    expect(fs.existsSync(newImagePath)).toBe(true);
    expect(fs.existsSync(oldImagePath)).toBe(false);

    fs.unlinkSync(newImagePath);
  });

  it('should return 500 if the username is invalid', async () => {
    const mockImageBuffer = Buffer.from('mock image data');
    const response = await request(app)
      .post('/users/invalid-username!/custom-image')
      .attach('image', mockImageBuffer, 'test-image.png');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Invalid username. It must be 3-20 characters long and contain only letters, numbers and underscores.');
  });
});

describe('User Service Default Image Update', () => {
  it('should update the default image for a user', async () => {
    const user = {
      username: 'defaultimageuser',
      passwordHash: 'hashedpassword'
    };
    await User.create(user);

    const response = await request(app)
      .post('/users/defaultimageuser/default-image')
      .send({ image: 'image_2.png' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Image updated successfully');
    expect(response.body).toHaveProperty('imagePath', '/images/default/image_2.png');

    const userInDb = await User.findOne({ username: 'defaultimageuser' });
    expect(userInDb.image).toBe('/images/default/image_2.png');
  });

  it('should return 400 if no default image is provided', async () => {
    const user = {
      username: 'nodefaultimageuser',
      passwordHash: 'hashedpassword'
    };
    await User.create(user);

    const response = await request(app)
      .post('/users/nodefaultimageuser/default-image')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'No default image provided');
  });

  it('should return 500 if the user does not exist', async () => {
    const response = await request(app)
      .post('/users/nonexistentuser/default-image')
      .send({ image: 'image_3.png' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  it('should delete the previous custom image if it exists', async () => {
    const user = {
      username: 'mockuser',
      passwordHash: 'hashedpassword',
      image: '/images/custom/old-image.png'
    };
    await User.create(user);

    const oldImagePath = path.join(__dirname, 'public', user.image);
    fs.mkdirSync(path.dirname(oldImagePath), { recursive: true });
    fs.writeFileSync(oldImagePath, 'old image data');

    const response = await request(app)
      .post('/users/mockuser/default-image')
      .send({ image: 'image_4.png' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('imagePath', '/images/default/image_4.png');

    const userInDb = await User.findOne({ username: 'mockuser' });
    expect(userInDb.image).toBe('/images/default/image_4.png');
    expect(fs.existsSync(oldImagePath)).toBe(false);
  });

  it('should return 500 if the username is invalid', async () => {
    const response = await request(app)
      .post('/users/invalid-username!/default-image')
      .send({ image: 'image_5.png' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Invalid username. It must be 3-20 characters long and contain only letters, numbers and underscores.');
  });
});
describe('Password Validation Tests', () => {

  it('should reject passwords without a length lower than eight', async () => {
    const invalidUser = {
      username: 'user1',
      password: 'Sh0rt!'
    };

    const response = await request(app).post('/adduser').send(invalidUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid password. It must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
  });

  it('should reject passwords without a lowercase letter', async () => {
    const invalidUser = {
      username: 'user1',
      password: 'NOLOWERCASE1@'
    };

    const response = await request(app).post('/adduser').send(invalidUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid password. It must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
  });

  it('should reject passwords without an uppercase letter', async () => {
    const invalidUser = {
      username: 'user2',
      password: 'nouppercase1@'
    };

    const response = await request(app).post('/adduser').send(invalidUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid password. It must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
  });

  it('should reject passwords without a number', async () => {
    const invalidUser = {
      username: 'user3',
      password: 'NoNumber@!'
    };

    const response = await request(app).post('/adduser').send(invalidUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid password. It must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
  });

  it('should reject passwords without a special character', async () => {
    const invalidUser = {
      username: 'user4',
      password: 'NoSpecial123'
    };

    const response = await request(app).post('/adduser').send(invalidUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid password. It must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
  });
});