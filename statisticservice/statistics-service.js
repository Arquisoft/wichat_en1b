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

/**
 * Helper: Build minGames and minScore filters for MongoDB $match
 * These are applied after statistics are calculated
 */
function buildMinFilters(minGames, minScore) {
  const filter = {};
  if (minGames) filter.gamesPlayed = { $gte: Number(minGames) };
  if (minScore) filter.totalScore = { $gte: Number(minScore) };
  return filter;
}

function buildRegistrationDateFilter(before, after) {
  const filter = {};

  if (before) {
    if (!isValidDateString(before)) {
      throw new Error('Invalid registeredBefore date format');
    }
    filter.registrationDate = filter.registrationDate || {};
    filter.registrationDate.$lt = new Date(before);
  }
  
  if (after) {
    if (!isValidDateString(after)) {
      throw new Error('Invalid registeredAfter date format');
    }
    filter.registrationDate = filter.registrationDate || {};
    filter.registrationDate.$gte = new Date(after);
  }
  
  return filter;
}

function isValidDateString(dateString) {
  if (dateString instanceof Date) return !isNaN(dateString.getTime());
  
  // Accepts only yyyy-mm-dd or yyyy-mm-ddTHH:MM:SS(.sss)Z
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/;
  if (!isoDateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;

  // If only date part, check that the day/month/year match
  if (dateString.length === 10) {
    // yyyy-mm-dd
    const [year, month, day] = dateString.split('-').map(Number);
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() + 1 === month &&
      date.getUTCDate() === day
    );
  }
  return true;
}

// Get statistics for all users (ordered)
app.get('/statistics', async (req, res) => {
  
  const validSortFields = [
    'username', 'gamesPlayed', 'questionsAnswered',
    'correctAnswers', 'incorrectAnswers', 'accuracy',
    'totalScore', 'maxScore', 'registrationDate'
  ];

  try {
    // Extract query parameters
    const {
      sort = 'totalScore',
      order = 'desc',
      limit = 50,
      offset = 0,
      gameType,
      minGames,
      minScore,
      registeredBefore,
      registeredAfter
    } = req.query;

    // Empty means global stats
    const validGameTypes = ['', 'classical', 'suddenDeath', 'timeTrial', 'custom', 'qod']; 

    if (!validSortFields.includes(sort)) return res.status(400).json({ error: 'Invalid sort field' });
    if (!['asc', 'desc'].includes(order)) return res.status(400).json({ error: 'Invalid sort order' });

    if (gameType && !validGameTypes.includes(gameType)) {
      return res.status(400).json({ error: 'Invalid game type' });
    }

    if (minGames !== undefined && (isNaN(Number(minGames)) || Number(minGames) < 0)) {
      return res.status(400).json({ error: 'Invalid minimum games value' });
    }
    if (minScore !== undefined && (isNaN(Number(minScore)) || Number(minScore) < 0)) {
      return res.status(400).json({ error: 'Invalid minimum score value' });
    }

    // Validation for dates
    if (registeredBefore && !isValidDateString(registeredBefore)) {
      return res.status(400).json({ error: 'Invalid registeredBefore date format' });
    }
    if (registeredAfter && !isValidDateString(registeredAfter)) {
      return res.status(400).json({ error: 'Invalid registeredAfter date format' });
    }

    if (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100) {
      return res.status(400).json({ error: 'Invalid limit value, must be between 1 and 100' });
    }
    if (isNaN(Number(offset)) || Number(offset) < 0) {
      return res.status(400).json({ error: 'Invalid offset value, must be non-negative' });
    }

    // Build initial match criteria
    let initialMatch = {};
    
    // Handle date filtering directly to ensure proper conversion
    if (registeredBefore) {
      initialMatch.registrationDate = initialMatch.registrationDate || {};
      initialMatch.registrationDate.$lt = new Date(registeredBefore);
      console.log(`Filter: registeredBefore=${registeredBefore}, converted to:`, initialMatch.registrationDate.$lt);
    }
    
    if (registeredAfter) {
      initialMatch.registrationDate = initialMatch.registrationDate || {};
      initialMatch.registrationDate.$gte = new Date(registeredAfter);
      console.log(`Filter: registeredAfter=${registeredAfter}, converted to:`, initialMatch.registrationDate.$gte);
    }
    
    // If there's a gameType filter, add a condition to only include users with at least one game of that type
    if (gameType) {
      initialMatch["games.gameType"] = gameType;
    }

    // Build the aggregation pipeline for MongoDB
    const pipeline = [
      // 1. Initial filter for registration date and game type existence
      {
        $match: initialMatch
      },
      // 2. Project only the needed fields (for performance)
      {
        $project: {
          username: 1,
          registrationDate: 1,
          games: 1,
          // Denormalized (pre-computed) fields for global stats
          gamesPlayed: { $ifNull: ["$gamesPlayed", 0] },
          correctAnswers: { $ifNull: ["$correctAnswers", 0] },
          questionsAnswered: { $ifNull: ["$questionsAnswered", 0] }
        }
      },
      // 3. If a gameType filter is set, create a filteredGames array with only those games
      {
        $addFields: {
          filteredGames: gameType ? {
            $filter: {
              input: "$games",
              as: "game",
              cond: { $eq: ["$$game.gameType", gameType] }
            }
          } : "$games"
        }
      },
      // 4. Calculate statistics based on filtered games
      {
        $addFields: {
          gameSpecificStats: {
            gamesPlayed: { $size: { $ifNull: ["$filteredGames", []] } },
            correctAnswers: { $sum: { $ifNull: ["$filteredGames.correctAnswers", [0]] } },
            questionsAnswered: { $sum: { $ifNull: ["$filteredGames.questionsAnswered", [0]] } },
            totalScore: { $sum: { $ifNull: ["$filteredGames.score", [0]] } },
            maxScore: { $max: { $ifNull: ["$filteredGames.score", [0]] } }
          }
        }
      },
      // 5. Choose the right stats based on whether we're filtering by game type
      {
        $addFields: {
          gamesPlayed: { $cond: [{ $eq: [gameType, ""] }, "$gamesPlayed", "$gameSpecificStats.gamesPlayed"] },
          correctAnswers: { $cond: [{ $eq: [gameType, ""] }, "$correctAnswers", "$gameSpecificStats.correctAnswers"] },
          questionsAnswered: { $cond: [{ $eq: [gameType, ""] }, "$questionsAnswered", "$gameSpecificStats.questionsAnswered"] },
          totalScore: { $cond: [{ $eq: [gameType, ""] }, 
                              { $sum: "$games.score" }, 
                              "$gameSpecificStats.totalScore"] },
          maxScore: { $cond: [{ $eq: [gameType, ""] }, 
                            { $max: "$games.score" }, 
                            "$gameSpecificStats.maxScore"] }
        }
      },
      // 6. Calculate incorrectAnswers and accuracy
      {
        $addFields: {
          incorrectAnswers: { $subtract: ["$questionsAnswered", "$correctAnswers"] },
          accuracy: {
            $cond: [
              { $eq: ["$questionsAnswered", 0] },
              0,
              { $multiply: [{ $divide: ["$correctAnswers", "$questionsAnswered"] }, 100] }
            ]
          }
        }
      },
      // 7. Apply minGames and minScore filters
      {
        $match: buildMinFilters(minGames, minScore)
      },
      // 8. Facet for pagination and total count
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { [sort]: order === 'asc' ? 1 : -1 } },
            { $skip: Number(offset) },
            { $limit: Number(limit) },
            {
              $project: {
                _id: 1,
                username: 1,
                registrationDate: 1,
                gamesPlayed: 1,
                questionsAnswered: 1,
                correctAnswers: 1,
                incorrectAnswers: 1,
                accuracy: 1,
                totalScore: 1,
                maxScore: 1
              }
            }
          ]
        }
      }
    ];

    // Run the aggregation pipeline
    const [result] = await User.aggregate(pipeline);

    // Prepare the response
    const total = result?.metadata[0]?.total || 0;
    const users = result?.data || [];

    res.json({
      users,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: (Number(offset) + users.length) < total
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
    res.status(404).json({ error: 'statistics.errors.userNotFound' });
  }
});

app.post('/recordGame', async (req, res) => {
  const username = req.headers['username'];
  if (!username) return res.status(400).json({ error: 'Username missing in request' });

  const gameStats = req.body;

  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(404).json({ error: 'statistics.errors.userNotFound' });
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

    return res.json({ message: 'Game recorded successfully' });
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
  if (!targetUser) return res.status(404).json({ error: 'statistics.errors.userNotFound' });

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
      maxCorrectAnswers: Math.max(...targetUser.games.map(game => game.correctAnswers)) || 0,
    },
    classicalStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'classical').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'classical').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'classical').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(...targetUser.games.filter(game => game.gameType === 'classical').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'classical').length,
      maxCorrectAnswers: Math.max(...targetUser.games.filter(game => game.gameType === 'classical').map(game => game.correctAnswers)) || 0,
    },
    suddenDeathStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'suddenDeath').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'suddenDeath').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'suddenDeath').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(...targetUser.games.filter(game => game.gameType === 'suddenDeath').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'suddenDeath').length,
      maxCorrectAnswers: Math.max(...targetUser.games.filter(game => game.gameType === 'suddenDeath').map(game => game.correctAnswers)) || 0,
    },
    timeTrialStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'timeTrial').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'timeTrial').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'timeTrial').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(...targetUser.games.filter(game => game.gameType === 'timeTrial').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'timeTrial').length,
      maxCorrectAnswers: Math.max(...targetUser.games.filter(game => game.gameType === 'timeTrial').map(game => game.correctAnswers)) || 0,
    },
    customStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'custom').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'custom').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'custom').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(...targetUser.games.filter(game => game.gameType === 'custom').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'custom').length,
      maxCorrectAnswers: Math.max(...targetUser.games.filter(game => game.gameType === 'custom').map(game => game.correctAnswers)) || 0,
    },
    qodStatistics: {
      questionsAnswered: targetUser.games.filter(game => game.gameType === 'qod').reduce((acc, game) => acc + game.questionsAnswered, 0),
      correctAnswers: targetUser.games.filter(game => game.gameType === 'qod').reduce((acc, game) => acc + game.correctAnswers, 0),
      incorrectAnswers: targetUser.games.filter(game => game.gameType === 'qod').reduce((acc, game) => acc + game.incorrectAnswers, 0),
      maxScore: Math.max(...targetUser.games.filter(game => game.gameType === 'qod').map(game => game.score)) || 0,
      gamesPlayed: targetUser.games.filter(game => game.gameType === 'qod').length,
      maxCorrectAnswers: Math.max(...targetUser.games.filter(game => game.gameType === 'qod').map(game => game.correctAnswers)) || 0,

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