// auth-service.js
const express = require('express');
const mongoose = require('mongoose');
const User = require('./auth-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const app = express();
const port = 8002; 

require('dotenv').config();

// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

// Route for user login
app.post('/login',  [
  check('username').notEmpty().withMessage('The username required'),
  check('password').notEmpty().withMessage('The password is required')
],async (req, res) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors['errors'] });
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
    res.status(500).json({ error: error.message });
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
