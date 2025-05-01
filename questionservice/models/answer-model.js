const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    correctOption: {
        type: String,
        required: true
    }
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
