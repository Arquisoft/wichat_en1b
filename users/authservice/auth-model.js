const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    passwordHash: String,
    registrationDate: Date,
});

const User = mongoose.model('User', userSchema);

module.exports = User