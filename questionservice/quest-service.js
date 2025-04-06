const express = require("express");
const cors = require("cors");
const WikidataController = require("./controllers/WikidataController");
const CronJob = require("cron").CronJob;
const mongoose = require("mongoose");
const { check, validationResult } = require('express-validator');

const app = express();
const port = 8004;

if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questiondb';
    mongoose.connect(mongoUri)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
};

const wikidataController = new WikidataController();

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

            const { questionId, answer } = req.body
            const isCorrect = await wikidataController.isQuestionCorrect(questionId, answer)
            res.json({ correct: isCorrect })
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Failed to validate answer" })
        }
    }
)

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

    wikidataController.preSaveWikidataItems(); // initial run to save
}

module.exports = server;