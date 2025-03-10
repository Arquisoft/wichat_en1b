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

const server = app.listen(port, () => {
    console.log(`Question Service listening at http://localhost:${port}`);
})

module.exports = server