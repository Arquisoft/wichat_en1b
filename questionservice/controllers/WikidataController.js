const WBK = require('wikibase-sdk')
const wbk = WBK({
    instance: 'https://www.wikidata.org',
    sparqlEndpoint: 'https://query.wikidata.org/sparql' // Required to use `sparqlQuery` and `getReverseClaims` functions, optional otherwise
})

const ANSWERS_PER_QUESTION = 4

class WikidataController {

    constructor() {
        this.questionToCorrectImage = new Map()
    }

    getRandomNumNotInSetAndUpdate(numLimit, set) {
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

    /**
     * Extracts from wikidata images and their associates, then selects 4 images and one of
     * their associates for the question so the question is constructed with it as the target
     * for the answer.
     * 
     * @param {string} query - SPARQL query for wikidata that has to use 
     * an 'image' variable and an 'itemLabel' variable, respectively containing
     * the image urls and the name of the associated entities (For example, flags and countries)
     * @param {string} imgTypeName - Name of what the images represent
     * @param {string} relation - Relation of the images with the question associated element
     * @returns - A JSON with the question (question) and the images (images)
     */
    async getQuestionAndImages(query, imgTypeName, relation) {
        //Required by wikidata to accept the request
        const headers = new Headers();
        headers.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        //Constructing the url for the wikidata request
        let url = wbk.sparqlQuery(query);

        const response = await fetch(url, { headers });
        const data = await response.json();
        const RESULTS_OBTAINED = data.results.bindings.length;

        let chosenItems = [];
        let chosenNums = [];
        // Generate n random numbers
        const regex = /Q\d*/;
        let pendingQuestions = ANSWERS_PER_QUESTION;
        while (pendingQuestions > 0) {
            const randomNum = this.getRandomNumNotInSetAndUpdate(RESULTS_OBTAINED, chosenNums);
            const randItem = data.results.bindings[randomNum];
            // Make sure label is not a QID and is not already chosen
            if (!regex.test(randItem.itemLabel.value) && !chosenItems.some(item => item.label === randItem.itemLabel.value)) {
                chosenItems.push({
                    label: randItem.itemLabel.value,
                    image: randItem.image.value
                })
                chosenNums.push(randomNum);
                pendingQuestions--;
            }
        }

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