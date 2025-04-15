const mongoose = require('mongoose');

// Schema for profile visits
const visitSchema = new mongoose.Schema({
  visitorUsername: {
    type: String,
    required: true
  },
  visitDate: {
    type: Date,
    default: Date.now
  }
});


const gameSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  gameType: {
    type: String,
    enum: ['classical', 'suddenDeath', 'timeTrial', 'qod', 'custom'],
    default: 'classical'
  },
  questionsAnswered: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  incorrectAnswers: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  gamesPlayed: {
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value',
    }
  },
  questionsAnswered: {
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value',
    }
  },
  correctAnswers: {
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value',
    }
  },
  incorrectAnswers: {
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value',
    }
  },
  profileVisits: {
    type: [visitSchema],
    default: []
  }, 
  totalVisits: {
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value',
    }
  },
  games: {
    type: [gameSchema],
    default: []
  } 
});


const User = mongoose.model('User', userSchema);

module.exports = User;