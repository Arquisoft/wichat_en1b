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
// app.get('/statistics', async (req, res) => {
//   const currentUsername = req.headers['currentuser'];
//   if (!currentUsername) return res.status(400).json({ error: 'Current user missing in request' });
// 
//   const targetUsername = req.headers['targetusername'];
//   if (!targetUsername) return res.status(400).json({ error: 'Target user missing in request' });
// 
//   const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
//   if (!usernameRegex.test(targetUsername)) return res.status(400).json({ error: 'Invalid username format' });
// 
//   const targetUser = await User.findOne({ username: targetUsername });
//   if (!targetUser) return res.status(404).json({ error: 'User not found' });
// 
//   // Record the profile visit if the visitor is not the profile owner
//   if (currentUsername !== targetUsername) {
//     console.log("currentUsername !== targetUsername")
//     // Use findOneAndUpdate to atomically update the document
//     await User.findOneAndUpdate(
//       { username: targetUsername },
//       {
//         $push: {
//           profileVisits: {
//             visitorUsername: currentUsername,
//             visitDate: new Date()
//           }
//         },
//         $inc: { totalVisits: 1 }
//       }
//     );
//   }
// 
//   // Prepare response data
//   const responseData = {
//     username: targetUser.username,
//     gamesPlayed: targetUser.gamesPlayed,
//     questionsAnswered: targetUser.questionsAnswered,
//     correctAnswers: targetUser.correctAnswers,
//     incorrectAnswers: targetUser.incorrectAnswers,
//     registrationDate: targetUser.registrationDate,
//     totalVisits: targetUser.totalVisits
//   };
// 
//   // Only add sensitive data for the profile owner
//   if (currentUsername === targetUsername) {
// 
//     // Get the most recent visitors (each user appears once)
//     const recentVisitors = targetUser.profileVisits
//       ? (() => {
//         // Create a map to track the most recent visit for each unique visitor
//         const visitorMap = new Map();
// 
//         // For each visit, keep only the most recent one per visitor
//         targetUser.profileVisits.forEach(visit => {
//           const existingVisit = visitorMap.get(visit.visitorUsername);
//           if (!existingVisit || new Date(visit.visitDate) > new Date(existingVisit.visitDate)) {
//             visitorMap.set(visit.visitorUsername, {
//               username: visit.visitorUsername,
//               date: visit.visitDate
//             });
//           }
//         });
// 
//         // Convert map values to array, sort by date (most recent first), and limit to 10
//         return Array.from(visitorMap.values())
//           .sort((a, b) => new Date(b.date) - new Date(a.date))
//           .slice(0, 10);
//       })()
//       : [];
// 
//     responseData.recentVisitors = recentVisitors;
//     responseData.isProfileOwner = true;
//   } else {
//     responseData.isProfileOwner = false;
//   }
// 
//   res.json(responseData);
// });
// 
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

app.post('/recordGame', async (req, res) => {
  const username = req.headers['username'];
  if (!username) return res.status(400).json({ error: 'Username missing in request' });

  const gameStats = req.body;

  const user = await User.findOne({ username: username });
  if (!user) return res.status(404).json({ error: 'User not found' });
  else {
    // Find the user and update the statistics
    await User.findOneAndUpdate(
      { username: username },
      {
        $push: {
          games: gameStats
        },
        $inc: { gamesPlayed: 1 }
      }
    );
  }
});

app.get('/statistics', async (req, res) => {
  const currentUsername = req.headers['currentuser'];
  if (!currentUsername) return res.status(400).json({ error: 'Current user missing in request' });

  const targetUsername = req.headers['targetusername'];
  if (!targetUsername) return res.status(400).json({ error: 'Target user missing in request' });

  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  if (!usernameRegex.test(targetUsername)) return res.status(400).json({ error: 'Invalid username format' });

  const targetUser = await User.findOne({ username: targetUsername });
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  // Record the profile visit if the visitor is not the profile owner
  if (currentUsername !== targetUsername) {
    console.log("currentUsername !== targetUsername")
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
  }

  // Prepare response data
  const responseData = {
    username: targetUser.username,
    gamesPlayed: targetUser.gamesPlayed,
    registrationDate: targetUser.registrationDate,
    totalVisits: targetUser.totalVisits,
    globalStatistics: {
      questionsAnswered: targetUser.games.reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(targetUser.games.map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.length,
    },
    classicalStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'classical').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'classical').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'classical').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(targetUser.games.filter(game => game.gameType === 'classical').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'classical').length,
    },
    suddenDeathStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'suddenDeath').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'suddenDeath').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'suddenDeath').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(targetUser.games.filter(game => game.gameType === 'suddenDeath').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'suddenDeath').length,
    },
    timeTrialStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'timeTrial').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'timeTrial').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'timeTrial').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(targetUser.games.filter(game => game.gameType === 'timeTrial').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'timeTrial').length,
    },
    customStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'custom').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'custom').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'custom').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(targetUser.games.filter(game => game.gameType === 'custom').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'custom').length,
    },
  }

  // Only add sensitive data for the profile owner
  if (currentUsername === targetUsername) {

    // Get the most recent visitors (each user appears once)
    const recentVisitors = targetUser.profileVisits
      ? (() => {
        // Create a map to track the most recent visit for each unique visitor
        const visitorMap = new Map();

        // For each visit, keep only the most recent one per visitor
        targetUser.profileVisits.forEach(visit => {
          const existingVisit = visitorMap.get(visit.visitorUsername);
          if (!existingVisit || new Date(visit.visitDate) > new Date(existingVisit.visitDate)) {
            visitorMap.set(visit.visitorUsername, {
              username: visit.visitorUsername,
              date: visit.visitDate
            });
          }
        });

        // Convert map values to array, sort by date (most recent first), and limit to 10
        return Array.from(visitorMap.values())
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10);
      })()
      : [];

    responseData.recentVisitors = recentVisitors;
    responseData.isProfileOwner = true;
  } else {
    responseData.isProfileOwner = false;
  }

  res.json(responseData);
});

// Start the Express.js server
const server = app.listen(port, () => {
  console.log(`Statistics Service listening at http://localhost:${port}`);
});

module.exports = server;