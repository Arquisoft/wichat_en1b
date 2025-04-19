const mongoose = require('mongoose');

const questionOfTheDaySchema = new mongoose.Schema({
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const QuestionOfTheDay = mongoose.model('QuestionOfTheDay', questionOfTheDaySchema);

module.exports = QuestionOfTheDay;