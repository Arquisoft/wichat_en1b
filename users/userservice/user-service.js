// user-service.js
const express = require('express');

const mongoose = require('mongoose');
const User = require('./user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

require('dotenv').config();

const app = express();
const port = 8001;

// Middleware to parse JSON in request body
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

function validateUsername(username) {
  // Convert to string first
  const usernameStr = String(username);
  
  // Allow only letters, numbers, and underscores, and ensure length between 3 and 20 characters
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (username==="" || !usernameRegex.test(usernameStr)) {
    throw new Error('Invalid username. It must be 3-20 characters long and contain only letters, numbers and underscores.');
  }
  // Return the sanitized string
  return usernameStr;
}

function validatePassword(password) {
  //convert to string
  const passwordStr = String(password);

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  if (password==="" || !strongPasswordRegex.test(passwordStr)) {
    throw new Error(
      'Invalid password. It must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
    );
  }

  return passwordStr;
}

// Helper function to delete an image file if it exists
function deleteImageFile(imagePath) {
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
}

// Refactor validateImageResource to handle both custom and default images
async function validateAndDeleteCurrentImage(username) {
  const user = await User.findOne({ username: { $eq: validateUsername(username) } });
  if (!user) {
    throw new Error('User not found');
  }

  if (user.image && user.image.startsWith('/images/custom/')) {
    const currentImagePath = path.join(__dirname, 'public', user.image);
    deleteImageFile(currentImagePath);
  }

  return user;
}

app.get('/users/:username/image', async (req, res) => {
  try {
    let user = await User.findOne({ username: { $eq: validateUsername(req.params.username) }});

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ image: user.image ?? '/images/default/image_1.png' });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/users/:username/custom-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const username = validateUsername(req.params.username);
    const user = await validateAndDeleteCurrentImage(username);

    const customImagesDir = path.join(__dirname, 'public', 'images', 'custom');

    if (!fs.existsSync(customImagesDir)) {
      fs.mkdirSync(customImagesDir, { recursive: true });
    }

    const sanitizedFilename = `${username}-${Date.now()}.png`;
    const filePath = path.join(customImagesDir, sanitizedFilename);

    fs.writeFileSync(filePath, req.file.buffer);

    const image = `/images/custom/${path.basename(filePath)}`;
    user.image = image;
    await user.save();

    res.json({ success: true, message: 'Image updated successfully', imagePath: image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/users/:username/default-image', async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ error: 'No default image provided' });
    }

    const username = validateUsername(req.params.username);
    const user = await validateAndDeleteCurrentImage(username);

    const image = `/images/default/${req.body.image}`;
    user.image = image;
    await user.save();

    res.json({ success: true, message: 'Image updated successfully', imagePath: image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/adduser', async (req, res) => {
  try {
    // Check if required fields are present in the request body
    validateRequiredFields(req, ['username', 'password', 'confirmpassword']);

    // Check if a user with the same username already exists
    const validatedUsername = validateUsername(req.body.username);  // Validate to prevent NoSQL injection
    const existingUser = await User.findOne({ username: { $eq: validatedUsername }});
    if (existingUser) {
      throw new Error('The username provided is already in use. Please choose a different one.');
    }

    if(req.body.password!==req.body.confirmpassword){
      throw new Error('The password and the confirmation do not match, please try again.');
    }
    const password = validatePassword(req.body.password);
    
    // Encrypt the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Assign a random image from the default images
    let image = `/images/default/image_${Math.floor(Math.random() * 16) + 1}.png`;

    const newUser = new User({
      username: validatedUsername,
      passwordHash: hashedPassword,
      image: image
    });

    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign(
      {
        userId: newUser._id,
        username: newUser.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token: token, username: newUser.username, createdAt: newUser.registrationDate });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

// Close MongoDB connection on server shutdown
server.on('close', () => {
  mongoose.connection.close();
});

module.exports = server;