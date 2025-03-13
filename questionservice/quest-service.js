const express = require("express");
const WikidataController = require("./controllers/WikidataController");

const app = express();
const port = 8004;

const wikidataController = new WikidataController();

app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({ message: "Server working" });
})

app.get("/foods", async(req, res) => {
    const query = `SELECT ?item ?itemLabel ?image WHERE {
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        ?item wdt:P31 wd:Q8195619;
          wdt:P18 ?image.
      }
      LIMIT 200`;
    const question = await wikidataController.getQuestionAndImages(query, "images", "corresponds to");
    res.json(question);
})

app.get("/question", async (req, res) => {
    const query = `SELECT ?item ?itemLabel ?image WHERE {
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        ?item wdt:P31 wd:Q8195619;
          wdt:P18 ?image.
      }
      LIMIT 1`; // Change limit if needed
    try {
        const question = await wikidataController.getQuestionAndImages(query, "images", "corresponds to");
        res.json(question);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch question" });
    }
});
// Validate an answer submitted by the game
app.post("/answer", async (req, res) => {
    try {
        const { questionId, answer } = req.body; 
        const isCorrect = await wikidataController.isQuestionCorrect(questionId, answer); 
        res.json({ correct: isCorrect });
    } catch (error) {
        res.status(500).json({ error: "Failed to validate answer" });
    }
});

const server = app.listen(port, () => {
    console.log(`Question Service listening at http://localhost:${port}`);
})

module.exports = server