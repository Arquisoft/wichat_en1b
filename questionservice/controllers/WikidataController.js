const WBK = require('wikibase-sdk')
const wbk = WBK({
    instance: 'https://www.wikidata.org',
    sparqlEndpoint: 'https://query.wikidata.org/sparql' // Required to use `sparqlQuery` and `getReverseClaims` functions, optional otherwise
})
const questionTypes = require('./questionTypes')

const ANSWERS_PER_QUESTION = 4
const INCORRECT_NAME_REGEX = /[QL]\d+/;

class WikidataController {

    constructor() {
        this.questionToCorrectImage = new Map()
    }

    getRandomNumNotInSetAndUpdate(numLimit, set) {
        // Check if we've exhausted all possible numbers
        if (set.length >= numLimit) {
            throw new Error('No more unique numbers available');
        }

        let randomNumber;
        do {
            randomNumber = Math.floor(Math.random() * numLimit);
        } while (set.includes(randomNumber)); // Ensure the number is unique
        set.push(randomNumber);
        return randomNumber
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getRandomStringId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    getRandomQuestionType() {
        const questionKeys = Object.keys(questionTypes);
        return questionKeys[Math.floor(Math.random() * questionKeys.length)];
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

    getRandomQuestionSelection(wikidataResults) {
        let chosenItems = [];
        let chosenNums = [];
        let pendingQuestions = ANSWERS_PER_QUESTION;
        wikidataResults = wikidataResults.filter(item => !INCORRECT_NAME_REGEX.test(item.itemLabel.value));

        while (pendingQuestions > 0) {
            const randomNum = this.getRandomNumNotInSetAndUpdate(wikidataResults.length, chosenNums);
            const randItem = wikidataResults[randomNum];
            // Make sure label is not a QID and is not already chosen
            if (!chosenItems.some(item => item.label === randItem.itemLabel.value)) {
                chosenItems.push({
                    label: randItem.itemLabel.value,
                    image: randItem.image.value
                })
                chosenNums.push(randomNum);
                pendingQuestions--;
            }
        }

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
            throw new Error("Invalid question type");
        }

        console.log(`[WikidataController] Getting question for: ${queryName}`);

        const { imgTypeName, relation, query } = questionTypes[queryName];
        const wikidataResults = await this.getWikidataResults(query);

        const chosenItems = this.getRandomQuestionSelection(wikidataResults);

        const randomId = this.getRandomStringId();
        const chosenItem = chosenItems[this.getRandomInt(0, chosenItems.length - 1)];
        const question = `Which of the following ${imgTypeName} ${relation} ${chosenItem.label}?`;
        this.questionToCorrectImage.set(randomId, chosenItem.image);

        const questionAndImages = {
            id: randomId,
            question: question,
            images: chosenItems.map(item => item.image)
        }

        return questionAndImages;
    }

    isQuestionCorrect(questionId, answer) {
        return this.questionToCorrectImage.get(questionId) === answer;
    }
}

module.exports = WikidataController;