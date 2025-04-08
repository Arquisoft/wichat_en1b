// user-service.js
const express = require('express');

const mongoose = require('mongoose');
const User = require('./user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { check, validationResult } = require('express-validator');
const multer = require('multer'); // Import multer

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
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

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
  if (!usernameRegex.test(usernameStr)) {
    throw new Error('Invalid username. It must be 3-20 characters long and contain only letters, numbers and underscores.');
  }
  // Return the sanitized string
  return usernameStr;
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

app.post('/users/:username/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const username = validateUsername(req.params.username);

    // Find the user to check the current image path
    const user = await User.findOne({ username: { $eq: username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the current image is a custom image and delete it
    if (user.image && user.image.startsWith('/images/custom/')) {
      const currentImagePath = path.join(__dirname, 'public', user.image);
      if (fs.existsSync(currentImagePath)) {
        fs.unlinkSync(currentImagePath); // Delete the existing custom image
      }
    }

    // Define the custom images directory
    const customImagesDir = path.join(__dirname, 'public', 'images', 'custom');

    // Ensure the directory exists
    if (!fs.existsSync(customImagesDir)) {
      fs.mkdirSync(customImagesDir, { recursive: true });
    }

    // Define the file path for the uploaded image
    const filePath = path.join(customImagesDir, `${username}-${Date.now()}-${req.file.originalname}`);

    // Save the file to the custom images directory
    fs.writeFileSync(filePath, req.file.buffer);

    let image = `/images/custom/${path.basename(filePath)}`;

    // Update the user's image path in the database
    user.image = image;
    await user.save();

    res.json({ image: image });
  } catch (error) {
    console.error('Error processing image upload:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/adduser', async (req, res) => {
  try {
    // Check if required fields are present in the request body
    validateRequiredFields(req, ['username', 'password']);

    // Check if a user with the same username already exists
    const validatedUsername = validateUsername(req.body.username);  // Validate to prevent NoSQL injection
    const existingUser = await User.findOne({ username: { $eq: validatedUsername }});
    if (existingUser) {
      throw new Error('The username provided is already in use. Please choose a different one.');
    }

    // Encrypt the password before saving it
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

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