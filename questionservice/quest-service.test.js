const request = require('supertest');

let app;

beforeAll(async () => {
    app = require('./quest-service');
})

afterAll(async () => {
    app.close();
})

describe('Question Service', () => {
    it('should give a status 200 when a GET request is send to /', async() => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    })
})