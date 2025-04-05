const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        required: true,
    },
    correctOption: {
        type: String,
        required: true,
    }
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;