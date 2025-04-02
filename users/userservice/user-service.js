// user-service.js
const express = require('express');
const mongoose = require('mongoose');
const User = require('./user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const port = 8001;

// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

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

    const newUser = new User({
      username: validatedUsername,
      passwordHash: hashedPassword,
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