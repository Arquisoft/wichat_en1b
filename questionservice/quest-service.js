const express = require("express");
const cors = require("cors");
const CronJob = require("cron").CronJob;
const mongoose = require("mongoose");
const { check, validationResult } = require('express-validator');

const WikidataController = require("./controllers/WikidataController");
const AnswerRepository = require("./repositories/AnswerRepository");

const app = express();
const port = 8004;

if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questiondb';
    mongoose.connect(mongoUri)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
};

const wikidataController = new WikidataController();
const answerRepository = new AnswerRepository();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).json({ message: "Server working" });
})

const getWikidataQuestion = async (req, res) => {
    try {
        const questionType = req.params.questionType;
        const question = await wikidataController.getQuestionAndImages(questionType);
        res.json(question)
    } catch (error) {
        console.error("Error fetching question:", error)
        res.status(500).json({ error: "Failed to fetch question" })
    }
}

/**
 * Get a random question
 * (using flags as the default question type temporaly)
 */
app.get("/question", async (req, _res, next) => {
    req.params.questionType = "random";
    next();
}, getWikidataQuestion);

/**
 * Get a question for a specific question type
 * i.e. /question/flags
 */
app.get("/question/:questionType", getWikidataQuestion);

// Validate an answer submitted by the game
app.post("/answer", [
    check('questionId').notEmpty().withMessage('The question id is required'),
    check('answer').notEmpty().withMessage('The answer is required')
],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors['errors'] });
            }

            const username = req.headers['username'];

            const { questionId, answer } = req.body;
            const recordedAnswer = await answerRepository.findAnswer(questionId, username);
            if (recordedAnswer) {
                return res.json({ correct: recordedAnswer.isCorrect })
            }
            const isCorrect = await wikidataController.isQuestionCorrect(questionId, answer)
            await answerRepository.createAnswer(questionId, username, answer, isCorrect)
            res.json({ correct: isCorrect })
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Failed to validate answer" })
        }
    }
)

app.get("/question-of-the-day", async (req, res) => {
    try {
        const username = req.headers['username'];
        const question = await wikidataController.getQuestionOfTheDay();
        const recordedAnswer = await answerRepository.findAnswer(question._id, username);
        delete question.correctOption;
        const questionOfTheDay = {
            ...question,
            recordedAnswer
        };
        res.json(questionOfTheDay);
    } catch (error) {
        console.error("Error fetching question of the day:", error)
        res.status(500).json({ error: "Failed to fetch question of the day" })
    }
})

const server = app.listen(port, () => {
    console.log(`Question Service listening at http://localhost:${port}`)
});

// a equivalent for if __name__ == "__main__": (when running the file directly)
if (require.main === module) {
    wikidataController.setTestQuestions(false);

    new CronJob(
        '0 * * * *', // every hour
        async () => {
            await wikidataController.preSaveWikidataItems();
        }, // onTick
        null, // onComplete
        true, // start
        'Europe/Madrid' // timeZone
    );

    new CronJob(
        '0 2 * * *', // every day at 02:00 AM
        async () => {
            await wikidataController.setQuestionOfTheDay();
        }, // onTick
        null, // onComplete
        true, // start
        'Europe/Madrid' // timeZone
    );

    wikidataController.initialRun(); // initial run to save items and set question of the day
}

module.exports = server;