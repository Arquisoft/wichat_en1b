const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./user-model');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

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
      password: 'Testpassword1!',
      confirmpassword: 'Testpassword1!'
    };
    
    const response = await request(app).post('/adduser').send(incompleteUser);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Missing required field: username');
  });
  
  it('should reject requests with missing password', async () => {
    const incompleteUser = {
      username: 'testuser2',
      confirmpassword: 'Testpassword1!'
    };
    
    const response = await request(app).post('/adduser').send(incompleteUser);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Missing required field: password');
  });

  it('should reject requests with missing confirmation password', async () => {
    const incompleteUser = {
      username: 'testUser3',
      password: 'Testpassword1!'
    };
    
    const response = await request(app).post('/adduser').send(incompleteUser);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Missing required field: confirmpassword');
  });

  it('should reject usernames that are too short', async () => {
    const invalidUser = {
      username: 'ab',
      password: 'Testpassword1!',
      confirmpassword: 'Testpassword1!'
    };
    
    const response = await request(app).post('/adduser').send(invalidUser);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('signUp.errors.invalidUsername');
  });
  
  it('should reject usernames with invalid characters', async () => {
    const invalidUser = {
      username: 'test-user!',
      password: 'Testpassword1!',
      confirmpassword: 'Testpassword1!'
    };
    
    const response = await request(app).post('/adduser').send(invalidUser);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('signUp.errors.invalidUsername');
  });
  
  it('should reject duplicate usernames', async () => {
    // Create a user
    await request(app).post('/adduser').send({
      username: 'duplicateuser',
      password: 'Testpassword1!',
      confirmpassword: 'Testpassword1!'
    });
    
    // Try to create the same user again
    const response = await request(app).post('/adduser').send({
      username: 'duplicateuser',
      password: 'Anotherpassword1!',
      confirmpassword:'Anotherpassword1!'
    });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('signUp.errors.duplicateUsername');
  });
  
  it('should validate and sanitize username for NoSQL injection attempts', async () => {
    const suspiciousUser = {
      username: { $ne: null }, // NoSQL injection attempt
      password: 'Testpassword1!',
      confirmpassword: 'Testpassword1!'
    };
    
    const response = await request(app).post('/adduser').send(suspiciousUser);
    
    expect(response.status).toBe(400);
  });
  
  it('should return a valid JWT token for successful registration', async () => {
    process.env.JWT_SECRET = 'testsecret';

    const newUser = {
      username: 'tokenuser',
      password: 'Testpassword1!',
      confirmpassword: 'Testpassword1!'
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
      password: 'Testpassword1!',
      confirmpassword: 'Testpassword1!'
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
    expect(response.body).toHaveProperty('error', 'signUp.errors.invalidUsername');
  });
});

describe('User Service Custom Image Rename on Username Update', () => {
  it('should rename custom image files when username is updated', async () => {
    process.env.JWT_SECRET = 'testsecret';
    
    // Create a user with a custom image
    const oldUsername = 'imageuser';
    const newUsername = 'newimageuser';
    const user = {
      username: oldUsername,
      passwordHash: 'hashedpassword',
      image: `/images/custom/${oldUsername}-oldimage.png`
    };
    await User.create(user);
    
    // Create the actual image file in the filesystem
    const customImagesDir = path.join(__dirname, 'public', 'images', 'custom');
    fs.mkdirSync(customImagesDir, { recursive: true });
    
    const oldImagePath = path.join(__dirname, 'public', user.image);
    fs.writeFileSync(oldImagePath, 'test image content');
    
    // Verify the old image exists
    expect(fs.existsSync(oldImagePath)).toBe(true);
    
    // Update the username
    const response = await request(app)
      .patch(`/users/${oldUsername}`)
      .send({ newUser: newUsername });
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('newUsername', newUsername);
    
    // Verify the user in database has been updated
    const updatedUser = await User.findOne({ username: newUsername });
    expect(updatedUser).not.toBeNull();
    expect(updatedUser.image).toMatch(new RegExp(`^/images/custom/${newUsername}-\\d+\\.png$`));
    
    // Verify old image no longer exists
    expect(fs.existsSync(oldImagePath)).toBe(false);
    
    // Verify new image exists
    const newImagePath = path.join(__dirname, 'public', updatedUser.image);
    expect(fs.existsSync(newImagePath)).toBe(true);
    
    // Verify the content of the image was preserved
    const imageContent = fs.readFileSync(newImagePath, 'utf8');
    expect(imageContent).toBe('test image content');
    
    // Clean up
    fs.unlinkSync(newImagePath);
  });
  
  it('should handle updating username for user with default image', async () => {
    // Setup
    process.env.JWT_SECRET = 'testsecret';
    
    // Create a user with a default image
    const oldUsername = 'defaultimageuser';
    const newUsername = 'newdefaultimageuser';
    const user = {
      username: oldUsername,
      passwordHash: 'hashedpassword',
      image: '/images/default/image_3.png'
    };
    await User.create(user);
    
    // Update the username
    const response = await request(app)
      .patch(`/users/${oldUsername}`)
      .send({ newUser: newUsername });
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('newUsername', newUsername);
    
    // Verify the user in database has been updated
    const updatedUser = await User.findOne({ username: newUsername });
    expect(updatedUser).not.toBeNull();
    
    // Default image path should remain unchanged
    expect(updatedUser.image).toBe('/images/default/image_3.png');
  });
  
  it('should handle if the custom image file does not exist during username update', async () => {
    // Setup
    process.env.JWT_SECRET = 'testsecret';
    
    // Create a user with a custom image path, but the file doesn't exist
    const oldUsername = 'nofileuser';
    const newUsername = 'newnofileuser';
    const user = {
      username: oldUsername,
      passwordHash: 'hashedpassword',
      image: `/images/custom/${oldUsername}-nonexistent.png`
    };
    await User.create(user);
    
    // Make sure custom images directory exists
    const customImagesDir = path.join(__dirname, 'public', 'images', 'custom');
    fs.mkdirSync(customImagesDir, { recursive: true });
    
    // The old image path (which doesn't actually exist on disk)
    const oldImagePath = path.join(__dirname, 'public', user.image);
    
    // Update the username
    const response = await request(app)
      .patch(`/users/${oldUsername}`)
      .send({ newUser: newUsername });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('newUsername', newUsername);
    
    // Verify the user in database has been updated
    const updatedUser = await User.findOne({ username: newUsername });
    expect(updatedUser).not.toBeNull();
    
    // Verify the image path has been updated, even though file didn't exist
    expect(updatedUser.image).toMatch(new RegExp(`^/images/custom/${newUsername}-\\d+\\.png$`));
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
    expect(response.body).toHaveProperty('error', 'signUp.errors.invalidUsername');
  });
});

const checkInvalidPasswordResponse = async (invalidUser) => {
  const response = await request(app).post('/adduser').send(invalidUser);
  expect(response.status).toBe(400);
  expect(response.body.error).toContain('signUp.errors.invalidPassword');
};

describe('Password Validation Tests', () => {

  it('should reject passwords without a length lower than eight', async () => {
    const shortUser = {
      username: 'user1',
      password: 'Sh0rt!',
      confirmpassword: 'Sh0rt!'
    };

    await checkInvalidPasswordResponse(shortUser);
  });

  it('should reject passwords without a lowercase letter', async () => {
    const noLowerUser = {
      username: 'user1',
      password: 'NOLOWERCASE1@',
      confirmpassword: 'NOLOWERCASE1@'
    };

    await checkInvalidPasswordResponse(noLowerUser);
  });

  it('should reject passwords without an uppercase letter', async () => {
    const noUpperUser = {
      username: 'user2',
      password: 'nouppercase1@',
      confirmpassword: 'nouppercase1@'
    };

    await checkInvalidPasswordResponse(noUpperUser);
  });

  it('should reject passwords without a number', async () => {
    const noNumberUser = {
      username: 'user3',
      password: 'NoNumber@!',
      confirmpassword: 'NoNumber@!'
    };

    await checkInvalidPasswordResponse(noNumberUser);
  });

  it('should reject passwords without a special character', async () => {
    const noSpecialUser = {
      username: 'user4',
      password: 'NoSpecial123',
      confirmpassword: 'NoSpecial123'
    };

    await checkInvalidPasswordResponse(noSpecialUser);
  });
});

describe('Password Confirmation Tests', () => {
  it('should reject passwords that do not match with the confirmation', async () => {
    const noSamePass = {
      username: 'NoSame',
      password: 'NoSame1!',
      confirmpassword: 'NoSame2@'
    };

    const response = await request(app).post('/adduser').send(noSamePass);
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('signUp.errors.passwordsDoNotMatch');
    });
});

describe('User Service Update Tests', () => {
  it('should update the username successfully', async () => {
    process.env.JWT_SECRET = 'testsecret';

    const user = {
      username: 'oldusername',
      passwordHash: 'hashedpassword'
    };
    await User.create(user);

    const response = await request(app)
      .patch('/users/oldusername')
      .send({ newUser: 'newusername' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('newUsername', 'newusername');
    expect(response.body).toHaveProperty('message', 'User updated successfully');
    expect(response.body).toHaveProperty('token');

    const userInDb = await User.findOne({ username: 'newusername' });
    expect(userInDb).not.toBeNull();
    expect(userInDb.username).toBe('newusername');
  });

  it('should return 400 if the new username is already in use', async () => {
    await User.create({ username: 'existinguser', passwordHash: 'hashedpassword' });
    await User.create({ username: 'conflictinguser', passwordHash: 'hashedpassword' });

    const response = await request(app)
      .patch('/users/existinguser')
      .send({ newUser: 'conflictinguser' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'signUp.errors.duplicateUsername');
  });

  it('should update the password successfully', async () => {
    const user = {
      username: 'passworduser',
      passwordHash: 'hashedpassword'
    };
    await User.create(user);

    const response = await request(app)
      .patch('/users/passworduser')
      .send({ newPassword: 'NewPassword1!', newPasswordRepeat: 'NewPassword1!' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'User updated successfully');

    const userInDb = await User.findOne({ username: 'passworduser' });
    const isPasswordValid = await bcrypt.compare('NewPassword1!', userInDb.passwordHash);
    expect(isPasswordValid).toBe(true);
  });

  it('should return 400 if the password and confirmation do not match', async () => {
    const user = {
      username: 'mismatchuser',
      passwordHash: 'hashedpassword'
    };
    await User.create(user);

    const response = await request(app)
      .patch('/users/mismatchuser')
      .send({ newPassword: 'NewPassword1!', newPasswordRepeat: 'DifferentPassword1!' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'signUp.errors.passwordsDoNotMatch');
  });

  it('should return 404 if the user does not exist', async () => {
    const response = await request(app)
      .patch('/users/nonexistentuser')
      .send({ newUser: 'newusername' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  it('should return 500 if the username is invalid', async () => {
    const response = await request(app)
      .patch('/users/invalid-username!')
      .send({ newUser: 'newusername' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'signUp.errors.invalidUsername');
  });

  it('should return a new token when the username is updated', async () => {
    process.env.JWT_SECRET = 'testsecret';
    const user = {
      username: 'tokenuser',
      passwordHash: 'hashedpassword'
    };
    await User.create(user);

    const response = await request(app)
      .patch('/users/tokenuser')
      .send({ newUser: 'newtokenuser' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(decoded).toHaveProperty('username', 'newtokenuser');
    expect(decoded).toHaveProperty('userId');
  });
});