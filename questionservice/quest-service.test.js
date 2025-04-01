const request = require('supertest');

const app = require('./quest-service');

afterAll(async () => {
    app.close();
})

describe('Question Service', () => {
    it('Should give a status 200 when a GET request is sent to /', async() => {
        let response = await request(app).get('/');
        expect(response.status).toBe(200);
    });

    it('Should retrieve questions through the /question endpoint', async() => {
        let response = await request(app).get('/question');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('question');
        expect(response.body).toHaveProperty('images');
        expect(response.body.images).toHaveLength(4);
    });

    it('Should validate correctly an answer', async() => {
        let response = await request(app).post('/answer', { 
            answer: 'http://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20Lithuania.svg',
            questionId: 'n80wtegkkgm98b2jfiu'}
        );

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('correct', true);
    });

    it('Should fail when the /question endpoint receiven an invalid question type', async() => {
        let response = await request(app).get('/question/dogs');

        expect(response.status).toBe(500); // In my opinion, this should be a 400 response code
        expect(response.body).toHaveProperty('error', 'Failed to fetch question');
    });
})