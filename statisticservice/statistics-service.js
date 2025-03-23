const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('../models/user-model');
const app = express();
const port = 8005;
require('dotenv').config();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',  // Allow requests from the frontend
  methods: ['GET', 'POST'],
  credentials: true                 // Allow cookies and credentials
}));

// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// GET endpoint to retrieve user statistics
app.get('/statistics', async (req, res) => {
  try {
    const { username } = req.query; // Get username from query parameters

    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      gamesPlayed: user.gamesPlayed,
      correctAnswers: user.correctAnswers,
      incorrectAnswers: user.incorrectAnswers
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST endpoint to update user statistics
app.post('/statistics/update', async (req, res) => {
  try {
    const { username, gamesPlayed, correctAnswers, incorrectAnswers } = req.body;

    const user = await User.findOne({ username });

    if (user) {
      if (gamesPlayed !== undefined) user.gamesPlayed += parseInt(gamesPlayed);
      if (correctAnswers !== undefined) user.correctAnswers += parseInt(correctAnswers);
      if (incorrectAnswers !== undefined) user.incorrectAnswers += parseInt(incorrectAnswers);
      await user.save();

      res.json({
        gamesPlayed: user.gamesPlayed,
        correctAnswers: user.correctAnswers,
        incorrectAnswers: user.incorrectAnswers,
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Express.js server
app.listen(port, () => {
  console.log(`Statistics Service listening at http://localhost:${port}`);
});