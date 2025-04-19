const QuestionOfTheDay = require('../models/question-day-model');

class QuestionOfTheDayRepository {
    async getQuestionOfTheDay() {
        return QuestionOfTheDay.findOne().sort({ date: -1 }).populate('question');
    }

    async createQuestionOfTheDay(questionId) {
        return QuestionOfTheDay.create({ question: questionId });
    }
}

module.exports = QuestionOfTheDayRepository;
