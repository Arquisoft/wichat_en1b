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

function isValidDateString(dateStr) {
  // Ensure it matches YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;

  const [year, month, day] = dateStr.split('-').map(Number);
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day;
}

// Get statistics for all users (ordered)
app.get('/statistics', async (req, res) => {

  // Extract query parameters for filtering and sorting
  const {
    sort = 'gamesPlayed',
    order = 'desc',
    limit = 50,
    offset = 0,
    gameType,
    minGames,
    minScore,
    registeredBefore,
    registeredAfter
  } = req.query;

  // Validate sort field
  const validSortFields = ['username', 'gamesPlayed', 'totalVisits', 'registrationDate', 'maxScore'];
  if (!validSortFields.includes(sort)) {
    return res.status(400).json({ error: 'Invalid sort field' });
  }

  // Validate sort order
  if (order !== 'asc' && order !== 'desc') {
    return res.status(400).json({ error: 'Invalid sort order, must be "asc" or "desc"' });
  }

  // Build query filter
  const filter = {};

  // Add game type filter if provided
  if (gameType) {
    const validGameTypes = ['classical', 'suddenDeath', 'timeTrial', 'custom', 'qod'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({ error: 'Invalid game type' });
    }
    filter['games.gameType'] = gameType;
  }

  // Add minimum games filter if provided
  if (minGames) {
    const gamesCount = parseInt(minGames);
    if (isNaN(gamesCount) || gamesCount < 0) {
      return res.status(400).json({ error: 'Invalid minimum games value' });
    }
    filter.gamesPlayed = { $gte: gamesCount };
  }

  // Add minimum score filter if provided
  if (minScore) {
    const score = parseInt(minScore);
    if (isNaN(score) || score < 0) {
      return res.status(400).json({ error: 'Invalid minimum score value' });
    }
    filter['games.score'] = { $gte: score };
  }

  // Add registration date filters if provided
  if (registeredBefore) {
    if (!isValidDateString(registeredBefore)) {
      return res.status(400).json({ error: 'Invalid registeredBefore date format' });
    } else {
      filter.registrationDate = filter.registrationDate || {};
      filter.registrationDate.$lte = new Date(registeredBefore);
    }
  }
  
  if (registeredAfter) {
    if (!isValidDateString(registeredAfter)) {
      return res.status(400).json({ error: 'Invalid registeredAfter date format' });
    } else {
      filter.registrationDate = filter.registrationDate || {};
      filter.registrationDate.$gte = new Date(registeredAfter);
    }
  }

  // Create sort object for MongoDB
  const sortObj = {};
  sortObj[sort] = order === 'asc' ? 1 : -1;

  const limitNum = parseInt(limit);
  const offsetNum = parseInt(offset);

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({ error: 'Invalid limit value, must be between 1 and 100' });
  }

  if (isNaN(offsetNum) || offsetNum < 0) {
    return res.status(400).json({ error: 'Invalid offset value, must be non-negative' });
  }

  // Get users with pagination and filtering
  const users = await User.find(filter)
    .sort(sortObj)
    .skip(offsetNum)
    .limit(limitNum);

  // Get total count for pagination info
  const totalCount = await User.countDocuments(filter);

  // Process users and create response
  const usersData = users.map(user => {
    return {
      username: user.username,
      gamesPlayed: user.gamesPlayed,
      registrationDate: user.registrationDate,
      totalVisits: user.totalVisits,
      globalStatistics: {
        questionsAnswered: user.games.reduce((acc, game) => acc + game.questionsAnswered, 0),
        correctAnswers: user.games.reduce((acc, game) => acc + game.correctAnswers, 0),
        incorrectAnswers: user.games.reduce((acc, game) => acc + game.incorrectAnswers, 0),
        maxScore: Math.max(...user.games.map(game => game.score)) || 0,
        gamesPlayed: user.games.length,
      }
    };
  });

  // Return response with pagination metadata
  res.json({
    users: usersData,
    pagination: {
      total: totalCount,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + usersData.length < totalCount
    }
  });
});

// Update statistics for a user (in the headers)
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
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  } else {
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

    return res.status(200).json({ message: 'Game recorded successfully' });
  }
});

// Get statistics for a user by username (in the URL)
app.get('/statistics/:username', async (req, res) => {
  const currentUsername = req.headers['currentuser'];
  if (!currentUsername) return res.status(400).json({ error: 'Current user missing in request' });

  const targetUsername = req.params.username;
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
      maxScore: Math.max(...targetUser.games.map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.length,
    },
    classicalStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'classical').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'classical').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'classical').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(...targetUser.games.filter(game => game.gameType === 'classical').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'classical').length,
    },
    suddenDeathStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'suddenDeath').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'suddenDeath').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'suddenDeath').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(...targetUser.games.filter(game => game.gameType === 'suddenDeath').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'suddenDeath').length,
    },
    timeTrialStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'timeTrial').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'timeTrial').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'timeTrial').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(...targetUser.games.filter(game => game.gameType === 'timeTrial').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'timeTrial').length,
    },
    customStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'custom').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'custom').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'custom').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(...targetUser.games.filter(game => game.gameType === 'custom').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'custom').length,
    },
    qodStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'qod').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'qod').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'qod').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(...targetUser.games.filter(game => game.gameType === 'qod').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'qod').length,
    }
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