const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../users/userservice/user-model');  // Use the same User model for all services
const app = express();
const port = 8005;
require('dotenv').config();

// Middleware to parse JSON in request body
app.use(express.json());

// Configure CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'token', 'Authorization'],
};
app.use(cors(corsOptions));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body));
  }
  next();
});

// Token verification middleware
const verifyToken = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = req.headers.token || req.body?.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const tokenValue = token;
  
  try {
    console.log('Attempting to verify token...');
    console.log('Token: ', tokenValue);
    console.log('Using secret key: ', process.env.JWT_SECRET);

     // Verify the token using the secret key
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    console.log('Token verified successfully. Decoded payload:', decoded);

    // Add decoded user info to the request
    req.user = decoded;

    next();
  } catch (error) {
    
    console.error('Authentication failed: Invalid token', error.message);

    return res.status(403).json({ authorized: false, error: 'Invalid token or outdated' });
  }
};

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


// GET endpoint to retrieve user statistics with token verification
app.get('/statistics', verifyToken, async (req, res) => {
  try {
    // Get user ID from JWT token
    const user = await User.findOne({ username: req.user.username }); // Use username from token
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      gamesPlayed: user.gamesPlayed,
      correctAnswers: user.correctAnswers,
      incorrectAnswers: user.incorrectAnswers
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// POST endpoint to update user statistics with token verification
app.post('/statistics/update', verifyToken, async (req, res) => {
  try {
    const { gamesPlayed, correctAnswers, incorrectAnswers } = req.body;
    const username = req.user.username;

    const user = await User.findOne({ username });
    
    if (user) {
      if (gamesPlayed !== undefined) user.gamesPlayed += parseInt(gamesPlayed);
      if (correctAnswers !== undefined) user.correctAnswers += parseInt(correctAnswers);
      if (incorrectAnswers !== undefined) user.incorrectAnswers += parseInt(incorrectAnswers);
      await user.save();
      
      console.log('Statistics updated for user:', username);
      res.json({
        gamesPlayed: user.gamesPlayed,
        correctAnswers: user.correctAnswers,
        incorrectAnswers: user.incorrectAnswers,
      });
    } else {
      console.log('User not found for update:', username);
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating statistics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the Express.js server
const server = app.listen(port, () => {
  console.log(`Statistics Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event
server.on('close', () => {
  mongoose.connection.close();
  console.log('Server closed and MongoDB connection terminated');
});

module.exports = server;