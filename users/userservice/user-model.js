const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    image: {
      type: String
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;