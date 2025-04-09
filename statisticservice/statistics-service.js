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
  console.log("arrived at statistics endpoint")
    const currentUsername = req.headers['currentuser'];
    if (!currentUsername) return res.status(400).json({ error: 'Current user missing in request' });

    console.log("currentUsername: ", currentUsername)

    const targetUsername = req.headers['targetusername'];
    if (!targetUsername) return res.status(400).json({ error: 'Target user missing in request' });

    console.log("targetUsername: ", targetUsername)

    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRegex.test(targetUsername)) return res.status(400).json({ error: 'Invalid username format' });  
    
    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Record the profile visit if the visitor is not the profile owner
    if (currentUsername !== targetUsername) {
      // Use findOneAndUpdate to atomically update the document
      await User.findOneAndUpdate(
          { username: targetUsername },
          { 
              $push: { 
                  profileVisits: { 
                      visitorUsername: currentUsername, 
                      visitDate: new Date() 
                  } 
              },
              $inc: { totalVisits: 1 }
          }
      );

      // Base response that everyone can see
      const responseData = {
        username: targetUser.username,
        gamesPlayed: targetUser.gamesPlayed,
        questionsAnswered: targetUser.questionsAnswered,
        correctAnswers: targetUser.correctAnswers,
        incorrectAnswers: targetUser.incorrectAnswers,
        registrationDate: targetUser.registrationDate,
        totalVisits: targetUser.totalVisits
      };

      // Only add sensitive data for the profile owner
      if (currentUsername === targetUsername) {

        // Get the most recent visitors (limited to 10)
        const recentVisitors = targetUser.profileVisits
            .sort((a, b) => b.visitDate - a.visitDate)
            .slice(0, 10)
            .map(visit => ({
                username: visit.visitorUsername,
                date: visit.visitDate
            }));
            
        
        responseData.recentVisitors = recentVisitors;
        responseData.isProfileOwner = true;
      } else {
        responseData.isProfileOwner = false;
      }
      
      res.json(responseData);
    }
});

// GET endpoint to get detailed visit statistics
app.get('/statistics/visits', async (req, res) => {
  try {
      const username = req.user;
      
      // Find the user
      const user = await User.findOne({ username: username });
      
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }
      
      // Process visit data for analysis
      const visits = user.profileVisits;
      
      // Get count of unique visitors
      const uniqueVisitors = [...new Set(visits.map(visit => visit.visitorUsername))].length;
      
      // Get visits per day for the last 30 days
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const recentVisits = visits.filter(visit => visit.visitDate >= thirtyDaysAgo);
      
      // Group by date
      const visitsPerDay = {};
      recentVisits.forEach(visit => {
          const dateStr = visit.visitDate.toISOString().split('T')[0];
          visitsPerDay[dateStr] = (visitsPerDay[dateStr] || 0) + 1;
      });
      
      res.json({
          username: user.username,
          totalVisits: user.totalVisits,
          uniqueVisitors: uniqueVisitors,
          visitsPerDay: visitsPerDay
      });
  } catch (error) {
      console.error('Error retrieving visit statistics:', error);
      res.status(500).json({ error: 'Failed to retrieve visit statistics' });
  }
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

  const user = await User.findOne({ username: username });

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