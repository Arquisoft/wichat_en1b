const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    gamesPlayed: {
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

const User = mongoose.model('User', statisticsSchema);

module.exports = User