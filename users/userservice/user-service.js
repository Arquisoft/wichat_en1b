// user-service.js
const express = require('express');
const mongoose = require('../../models/node_modules/mongoose');
const bcrypt = require('bcrypt');
const User = require('../../models/user-model')
const jwt = require('jsonwebtoken');
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

app.post('/adduser', async (req, res) => {
    try {
        // Check if required fields are present in the request body
        validateRequiredFields(req, ['username', 'password']);

        // Encrypt the password before saving it
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            passwordHash: hashedPassword,
        });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, (process.env.JWT_SECRET), { expiresIn: '1h' });
      
        res.json({ token: token, username: newUser.username, createdAt: newUser.registrationDate });
      } catch (error) {
        res.status(400).json({ error: error.message }); 
    }});

// Start the server
const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

// Close MongoDB connection on server shutdown
server.on('close', () => {
  mongoose.connection.close();
});

module.exports = server;