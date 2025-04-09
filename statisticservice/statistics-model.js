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
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;