const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');  // Use the same User model for all services
const { check, matchedData, validationResult } = require('express-validator');
const app = express();
const port = 8002; 

require('dotenv').config();

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

// Route for user login
app.post('/login',  [
  check('username').isLength({ min: 3 }).trim().escape(),
  check('password').isLength({ min: 3 }).trim().escape()
],async (req, res) => {
  try {
    // Check if required fields are present in the request body
  
  validateRequiredFields(req, ['username', 'password']);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().toString()});
  }
    let username =req.body.username.toString();
    let password =req.body.password.toString();

    // Find the user by username in the database
    const user = await User.findOne({ username });
    
    // Check if the user exists and verify the password
    if (user && await bcrypt.compare(password, user.passwordHash)) {

      // Generate a JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Respond with the token and user information
      res.json({ token: token, username: username, createdAt: user.registrationDate });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Auth Service listening at http://localhost:${port}`);
});

server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });

module.exports = server
