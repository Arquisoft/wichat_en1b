const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      // required: true,
    },
    passwordHash: {
      type: String,
      required: true,
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
    }
});

const User = mongoose.model('User', userSchema);

module.exports = { mongoose, User };