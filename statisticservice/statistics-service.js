const express = require('express');
const mongoose = require('mongoose');
const User = require('./statistics-model');

const app = express();
const port = 8005;

// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

app.get('/statistics/:user', async (req, res) => {
    try {
        // Find the user by username in the database
        let username = req.params.user.toString();
        const user = await User.findOne({ username });

        if (user) {
            res.json({gamesPlayed: user.gamesPlayed, correctAnswers: user.correctAnswers, incorrectAnswers: user.incorrectAnswers});
        }
        else {
            res.status(401).json({ error: 'Invalid user' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const server = app.listen(port, () => {
  console.log(`Statistics Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });

module.exports = server