const Question = require('../models/question-model');

class QuestionRepository {
    async newQuestion(question) {
        return Question.create(question);
    }

    async isAnswerCorrect(questionId, answer) {
        const question = await Question.findById(questionId);
        if (!question) return false;
        return question.correctOption === answer;
    }

}

module.exports = QuestionRepository;