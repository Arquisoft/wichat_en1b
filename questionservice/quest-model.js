const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    questionText:String,
    imageUrls:String,
    correctAnswer:String,
    options:[String],
});

const Quest = mongoose.model('Quest', questSchema);

module.exports = Quest;
