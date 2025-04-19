const request = require('supertest');
const WikidataItemRepository = require('./repositories/WikidataItemRepository');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const WikidataController = require('./controllers/WikidataController');

let app, mongoServer, wikidataController;

const mockItems = [{
    wikidataId: 'Q1',
    type: 'flags',
    label: 'Test Item',
    image: 'https://example.com/test-item.jpg',
    isTest: true
},
{
    wikidataId: 'Q2',
    type: 'flags',
    label: 'Test Item 2',
    image: 'https://example.com/test-item2.jpg',
    isTest: true
},
{
    wikidataId: 'Q3',
    type: 'flags',
    label: 'Test Item 3',
    image: 'https://example.com/test-item3.jpg',
    isTest: true
},
{
    wikidataId: 'Q4',
    type: 'flags',
    label: 'Test Item 4',
    image: 'https://example.com/test-item4.jpg',
    isTest: true
}]


beforeAll(async () => {
    wikidataController = new WikidataController();

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log("mongoUri");
    console.log(mongoUri);
    process.env.MONGODB_URI = mongoUri;

    app = require('./quest-service');

    const repo = new WikidataItemRepository();
    await repo.bulkWrite(mockItems);
});

afterAll(async () => {
    if (app && app.listening) {
        await new Promise((resolve) => app.close(resolve));
    }
    await mongoose.connection.close();
    if (mongoServer) {
        await mongoServer.stop();
    }
})

describe('Question Service', () => {
    const verifyQuestionResponse = (response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('question');
        expect(response.body).toHaveProperty('images');
        expect(response.body.images).toHaveLength(4);
    }

    it('Should give a status 200 when a GET request is sent to /', async () => {
        let response = await request(app).get('/');
        expect(response.status).toBe(200);
    });

    it('Should retrieve questions through the /question endpoint', async () => {
        let response = await request(app).get('/question/flags');
        verifyQuestionResponse(response);
    });

    it('Should validate correctly an answer', async () => {
        let response = await request(app)
            .post('/answer')
            .send({
                answer: 'http://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20Lithuania.svg',
                questionId: '67f14a3f3a6d351adaa0929f'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('correct');
    });

    it('Should fail when the /question endpoint receiven an invalid question type', async () => {
        let response = await request(app).get('/question/dogs');

        expect(response.status).toBe(500); // In my opinion, this should be a 400 response code
        expect(response.body).toHaveProperty('error', 'Failed to fetch question');
    });

    it('More than 0 wikidata items should be fetched for presaving', async () => {
        const result = await wikidataController.preSaveWikidataItems(["flags"]);

        expect(result.fetchedItems).toBeGreaterThan(0);
    })

    it('Should return the question of the day / store a new one if none exists', async () => {
        const question = await wikidataController.checkInitialQuestionOfTheDay("flags");
        expect(question).toHaveProperty('_id');
    })

    it('Should return the question of the day', async () => {
        let response = await request(app).get('/question-of-the-day');
        verifyQuestionResponse(response);
    })
})