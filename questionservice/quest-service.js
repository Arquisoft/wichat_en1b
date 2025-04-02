const express = require("express")
const cors  = require("cors")
const WikidataController = require("./controllers/WikidataController")

const app = express()
const port = 8004

const wikidataController = new WikidataController()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.status(200).json({ message: "Server working" })
})

const getWikidataQuestion = async(req, res) => {
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
app.get("/question", async(req, _res, next) => {
    req.params.questionType = "random";
    next();
}, getWikidataQuestion);

/**
 * Get a question for a specific question type
 * i.e. /question/flags
 */
app.get("/question/:questionType", getWikidataQuestion);

// Validate an answer submitted by the game
app.post("/answer", async(req, res) => {
    try {
        const { questionId, answer } = req.body
        const isCorrect = wikidataController.isQuestionCorrect(questionId, answer)
        res.json({ correct: isCorrect })
    } catch (error) {
        res.status(500).json({ error: "Failed to validate answer" })
    }
})

const server = app.listen(port, () => {
    console.log(`Question Service listening at http://localhost:${port}`)
})

module.exports = server