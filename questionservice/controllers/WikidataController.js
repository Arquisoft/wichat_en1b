const WBK = require('wikibase-sdk')
const wbk = WBK({
    instance: 'https://www.wikidata.org',
    sparqlEndpoint: 'https://query.wikidata.org/sparql' // Required to use `sparqlQuery` and `getReverseClaims` functions, optional otherwise
})
const questionTypes = require('./questionTypes');

const WikidataItemRepository = require('../repositories/WikidataItemRepository');
const QuestionRepository = require('../repositories/QuestionRepository');

const ANSWERS_PER_QUESTION = 4
const INCORRECT_NAME_REGEX = /[QL]\d+/;

class WikidataController {

    constructor() {
        this.wikidataItemRepository = new WikidataItemRepository();
        this.questionRepository = new QuestionRepository();
        this.getTestQuestions = true;
    }

    setTestQuestions(value) {
        this.getTestQuestions = value;
    }


    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    getRandomQuestionType() {
        const questionKeys = Object.keys(questionTypes);
        return questionKeys[Math.floor(Math.random() * questionKeys.length)];
    }

    filterIncorrectNameItems(items) {
        return items.filter(item => !INCORRECT_NAME_REGEX.test(item.itemLabel.value));
    }

    async getWikidataResults(query) {
        //Constructing the url for the wikidata request
        let url = wbk.sparqlQuery(query);

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
            }
        });
        const data = await response.json();
        return data.results.bindings;
    }

    async getRandomQuestionSelection(queryName) {
        const randomItems = await this.wikidataItemRepository.getRandomByType(queryName, this.getTestQuestions, ANSWERS_PER_QUESTION);
        let chosenItems = randomItems.map(item => ({
            label: item.label,
            image: item.image
        }));

        return chosenItems;
    }

    /**
     * Extracts from wikidata images and their associates, then selects 4 images and one of
     * their associates for the question so the question is constructed with it as the target
     * for the answer.
     * 
     * @param {string} queryName - Name of the question type to be used
     * @returns - A JSON with the question (question) and the images (images)
     */
    async getQuestionAndImages(queryName) {

        if (queryName == "random") {
            queryName = this.getRandomQuestionType();
        }

        if (!questionTypes[queryName]) {
            throw new Error("Invalid question type: " + queryName);
        }

        console.log(`[WikidataController] Getting question for: ${queryName}`);

        const { imgTypeName, relation } = questionTypes[queryName];
        const chosenItems = await this.getRandomQuestionSelection(queryName);
        if (chosenItems.length !== ANSWERS_PER_QUESTION) {
            throw new Error("Not enough items found");
        }
        const chosenItem = chosenItems[this.getRandomInt(0, chosenItems.length - 1)];
        const questionAndImages = {
            imageType: imgTypeName,
            relation: relation,
            topic: chosenItem.label,
            images: chosenItems.map(item => item.image)
        }
        const savedQuestion = await this.questionRepository.newQuestion({
            ...questionAndImages,
            correctOption: chosenItem.image
        });
        return {
            id: savedQuestion._id,
            ...questionAndImages
        };
    }

    async isQuestionCorrect(questionId, answer) {
        return await this.questionRepository.isAnswerCorrect(questionId, answer);
    }

    async preSaveWikidataItems(explicitQuestionTypes = null) {
        let resultReport = { fetchedItems: 0 };

        const fetchQuestionTypes = explicitQuestionTypes ? explicitQuestionTypes : Object.keys(questionTypes);

        for (const questionKey of fetchQuestionTypes) {
            try {
                const { query } = questionTypes[questionKey];
                const wikidataResults = await this.getWikidataResults(query);

                const bulkOps = this.filterIncorrectNameItems(wikidataResults).map(result => ({
                    wikidataId: result.item.value.split('/').pop(),
                    label: result.itemLabel.value,
                    image: result.image.value,
                    type: questionKey,
                    isTest: this.getTestQuestions
                }));

                await this.wikidataItemRepository.bulkWrite(bulkOps);

                resultReport.fetchedItems += bulkOps.length;
            } catch (err) {
                console.error(`Error fetching items for ${questionKey}:`, err);
            }
        }
        return resultReport;
    }

}

module.exports = WikidataController;