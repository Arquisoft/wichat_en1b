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
 * Helper: Build registration date filter for MongoDB $match
 */
function buildRegistrationDateFilter(before, after) {
  const filter = {};

  if (before) {
    if (!isValidDateString(before)) {
      throw new Error('Invalid registeredBefore date format');
    }
    filter.registrationDate = filter.registrationDate || {};
    filter.registrationDate.$lte = new Date(before);
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

/**
 * Helper: Build gameType filter for MongoDB $match
 * Only matches users who have at least one game of the specified type
 */
function buildGameTypeFilter(gameType) {
  if (!gameType) return {};
  return { "games.gameType": gameType };
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

function isValidDateString(dateString) {
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


    const validGameTypes = ['classical', 'suddenDeath', 'timeTrial', 'qod', 'custom'];

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

    // Build the aggregation pipeline for MongoDB
    const pipeline = [
      // 1. Filter users by registration date and gameType (if provided)
      {
        $match: {
          ...buildRegistrationDateFilter(registeredBefore, registeredAfter),
          ...buildGameTypeFilter(gameType)
        }
      },
      // 2. Project only the needed fields (for performance)
      {
        $project: {
          username: 1,
          registrationDate: 1,
          games: 1,
          // Denormalized (pre-computed) fields for global stats
          denormGamesPlayed: "$gamesPlayed",
          denormCorrect: "$correctAnswers",
          denormQuestions: "$questionsAnswered"
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
      // 4. Calculate statistics for each user
      {
        $addFields: {
          // If gameType is set, calculate stats from filteredGames; otherwise, use denormalized fields
          gamesPlayed: gameType ? { $size: "$filteredGames" } : "$denormGamesPlayed",
          correctAnswers: gameType ? { $sum: "$filteredGames.correctAnswers" } : "$denormCorrect",
          questionsAnswered: gameType ? { $sum: "$filteredGames.questionsAnswered" } : "$denormQuestions",
          totalScore: { $sum: "$filteredGames.score" },
          maxScore: { $max: "$filteredGames.score" }
        }
      },
      // 5. Calculate incorrectAnswers and accuracy
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
      // 6. Filter out users who don't meet minGames or minScore requirements (if provided)
      {
        $match: buildMinFilters(minGames, minScore)
      },
      // 7. Facet for pagination and total count
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { [sort]: order === 'asc' ? 1 : -1 } },
            { $skip: Number(offset) },
            { $limit: Number(limit) },
            {
              $project: {
                _id: 0,
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