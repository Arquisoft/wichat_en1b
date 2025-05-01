const Answer = require('../models/answer-model');

class AnswerRepository {
    async createAnswer(questionId, username, answer, isCorrect, correctOption) {
        return Answer.create({ questionId, username, answer, isCorrect, correctOption });
    }

    async findAnswer(questionId, username) {
        const answer = await Answer.findOne({ questionId, username });
        return answer;
    }
}

module.exports = AnswerRepository;
