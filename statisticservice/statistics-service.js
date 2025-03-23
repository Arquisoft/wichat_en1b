const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

// Middleware to verify JWT token and attach the user to the request
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token missing' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user; // Attach the verified user to the request
        next();
    });
};

// GET endpoint to retrieve user statistics
app.get('/statistics', authMiddleware, async (req, res) => {
  try {
      const user = await User.findOne({ username: req.user.username });
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({
          gamesPlayed: user.gamesPlayed,
          questionsAnswered: user.questionsAnswered,
          correctAnswers: user.correctAnswers,
          incorrectAnswers: user.incorrectAnswers
      });
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST endpoint to update user statistics
app.post('/statistics/update', authMiddleware, async (req, res) => {
  try {
    const { gamesPlayed, questionsAnswered, correctAnswers, incorrectAnswers } = req.body;
    const user = await User.findOne({ username: req.user.username });

    if (user) {
        if (gamesPlayed !== undefined) user.gamesPlayed += parseInt(gamesPlayed);
        if (questionsAnswered !== undefined) user.questionsAnswered += parseInt(questionsAnswered);
        if (correctAnswers !== undefined) user.correctAnswers += parseInt(correctAnswers);
        if (incorrectAnswers !== undefined) user.incorrectAnswers += parseInt(incorrectAnswers);
        await user.save();

        res.json({
            gamesPlayed: user.gamesPlayed,
            questionsAnswered: user.questionsAnswered,
            correctAnswers: user.correctAnswers,
            incorrectAnswers: user.incorrectAnswers,
        });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error("Error in /statistics/update:", error); // Log the error
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Express.js server
app.listen(port, () => {
  console.log(`Statistics Service listening at http://localhost:${port}`);
});