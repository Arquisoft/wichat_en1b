const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./statistics-model');
const app = express();
const port = 8005;
require('dotenv').config();

// Enable CORS
app.use(cors());
app.use(express.json());

// Connect to MongoDB only if not already connected
if (mongoose.connection.readyState === 0) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
  mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
}

// GET endpoint to retrieve user statistics
app.get('/statistics', async (req, res) => {
    const username = req.headers['username'];
    if (!username) return res.status(400).json({ error: 'Username missing in request' });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
        gamesPlayed: user.gamesPlayed,
        questionsAnswered: user.questionsAnswered,
        correctAnswers: user.correctAnswers,
        incorrectAnswers: user.incorrectAnswers,
        registrationDate: user.registrationDate,
    });
});

// POST endpoint to update user statistics
app.post('/statistics', async (req, res) => {
  const username = req.headers['username'];
  if (!username) return res.status(400).json({ error: 'Username missing in request' });
  
  const { gamesPlayed, questionsAnswered, correctAnswers, incorrectAnswers } = req.body;

  if (
    (gamesPlayed !== undefined && isNaN(gamesPlayed)) ||
    (questionsAnswered !== undefined && isNaN(questionsAnswered)) ||
    (correctAnswers !== undefined && isNaN(correctAnswers)) ||
    (incorrectAnswers !== undefined && isNaN(incorrectAnswers))
  ) {
    return res.status(400).json({ error: 'Invalid input: All statistics must be numbers.' });
  }

  const user = await User.findOne({ username });

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
});

// Start the Express.js server
const server = app.listen(port, () => {
  console.log(`Statistics Service listening at http://localhost:${port}`);
});

module.exports = server;