const express = require('express');
const cors = require("cors"); // Import CORS
const mongoose = require('mongoose');
const User = require('./statistics-model');

const app = express();
const port = 8005;

// Middleware to parse JSON in request body
app.use(express.json());

// Configure CORS to allow requests from the frontend application
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, // Allow credentials (cookies) to be sent
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });


// GET endpoint to retrieve user statistics
app.post('/statistics', async (req, res) => {
  try {
    const userId = req.body.user.id;   // Get the user ID from the token
    const user = await User.findById(userId);

    if (user) {
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

// POST endpoint to update user statistics when a game is played
app.post('/statistics/update', async (req, res) => {
  try {
    const { gamesPlayed, correctAnswers, incorrectAnswers } = req.body;
    const userId = req.user.id; // Get the user ID from the token
    const user = await User.findById(userId);

    if (user) {
      if (gamesPlayed !== undefined) user.gamesPlayed += gamesPlayed;
      if (correctAnswers !== undefined) user.correctAnswers += correctAnswers;
      if (incorrectAnswers !== undefined) user.incorrectAnswers += incorrectAnswers;

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
const server = app.listen(port, () => {
  console.log(`Statistics Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
  // Close the Mongoose connection
  mongoose.connection.close();
});

module.exports = server;