const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./statistics-model');
const app = express();
const port = 8005;
require('dotenv').config(); // To access JWS_SECRET from .env file

// Middleware to parse JSON in request body
app.use(express.json());

// Configure CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Token verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.token;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JSW_SECRET);
    
    // Add decoded user info to the request
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

// POST endpoint to retrieve user statistics with token verification
app.post('/statistics', verifyToken, async (req, res) => {
  try {
      // Get the username from the request body
      const username = req.body.user.username;
      console.log('Retrieving statistics for user:', username);

      // Find the user by username
      const user = await User.findOne({ username: username });

      if (user) {
        console.log('Statistics found for user:', username);
        res.json({
          gamesPlayed: user.gamesPlayed,
          correctAnswers: user.correctAnswers,
          incorrectAnswers: user.incorrectAnswers,
        });
      } else {
        console.log('User not found:', username);
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error retrieving statistics:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST endpoint to update user statistics with token verification
app.post('/statistics/update', verifyToken, async (req, res) => {
  try {
    const { username, gamesPlayed, correctAnswers, incorrectAnswers } = req.body;
    console.log('Updating statistics for user:', username);
    
    // Find user by username
    const user = await User.findOne({ username: username });
    
    if (user) {
      if (gamesPlayed !== undefined) user.gamesPlayed += gamesPlayed;
      if (correctAnswers !== undefined) user.correctAnswers += correctAnswers;
      if (incorrectAnswers !== undefined) user.incorrectAnswers += incorrectAnswers;
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
});

module.exports = server;