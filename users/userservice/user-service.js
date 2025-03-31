// user-service.js
const express = require('express');
const mongoose = require('mongoose');
const User = require('./user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const port = 8001;

// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

app.post('/adduser', [
    check('username').notEmpty().withMessage('The username required'),
    check('password').notEmpty().withMessage('The password is required')
  ], async (req, res) => {
    try {
        const errors = validationResult(req);
          
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors['errors'] });
        }
        // Encrypt the password before saving it
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            passwordHash: hashedPassword,
        });

        const token = jwt.sign({ userId: newUser._id }, (process.env.JWT_SECRET), { expiresIn: '1h' });
        await newUser.save();
      
        res.json({ token: token, username: newUser.username, createdAt: newUser.registrationDate });
      } catch (error) {
        res.status(500).json({ error: error.message }); 
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