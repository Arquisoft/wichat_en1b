const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('./statistics-model');
let mongoServer;
let server;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  // Import after setting env var
  server = require('./statistics-service');
});

beforeEach(async () => {
  // Clean database before each test
  await User.deleteMany({});
});

afterAll(async () => {
  // Close server & connections
  await mongoose.disconnect();
  server.close();
  await mongoServer.stop();
});

describe('GET /statistics', () => {

  const users = [
    {
      username: 'alice',
      gamesPlayed: 1,
      correctAnswers: 1,
      questionsAnswered: 1,
      registrationDate: new Date(),
      totalVisits: 0,
      games: [
        { username: 'alice', gameType: 'classical', score: 50, questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 },
        { username: 'alice', gameType: 'timeTrial', score: 50, questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 }
      ]
    },
    {
      username: 'bob',
      gamesPlayed: 3,
      correctAnswers: 2,
      questionsAnswered: 2,
      registrationDate: new Date(),
      totalVisits: 0,
      games: [
        { username: 'bob', gameType: 'classical', score: 60, questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 },
        { username: 'bob', gameType: 'classical', score: 70, questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 }
      ]
    }
  ];

  it('should return users sorted by totalScore desc with pagination info', async () => {
    await User.insertMany(users);

    const res = await request(server).get('/statistics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(res.body.users).toHaveLength(2);
    expect(res.body.users[0].username).toBe('bob');
    expect(res.body.pagination).toMatchObject({ total: 2, limit: 50, offset: 0, hasMore: false });
  });

  it('should filter by gameType', async () => {
    await User.insertMany(users);

    const res = await request(server).get('/statistics?gameType=timeTrial');
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0].username).toBe('alice');
  });

  it('should filter by minGames', async () => {
    await User.insertMany(users);

    const res = await request(server).get('/statistics?minGames=2');
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0].username).toBe('bob');
  });

  it('should filter by minScore', async () => {
    await User.insertMany(users);

    const res = await request(server).get('/statistics?minScore=110');
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0].username).toBe('bob');
  });

  it('should filter by registeredBefore', async () => {
    await User.deleteMany({});
    const now = new Date();
    const future = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day in the future

    const dateUsers = [
      {
        username: 'alice',
        gamesPlayed: 1,
        correctAnswers: 1,
        questionsAnswered: 1,
        registrationDate: now,
        totalVisits: 0,
        games: [
          { username: 'alice', gameType: 'classical', score: 50, questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 }
        ]
      },
      {
        username: 'bob',
        gamesPlayed: 3,
        correctAnswers: 2,
        questionsAnswered: 2,
        registrationDate: new Date(future.getTime() + 24 * 60 * 60 * 1000), // Bob is after 'future'
        totalVisits: 0,
        games: [
          { username: 'bob', gameType: 'classical', score: 60, questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 },
          { username: 'bob', gameType: 'classical', score: 40, questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 }
        ]
      }
    ];
    await User.insertMany(dateUsers);

    const res = await request(server).get(`/statistics?registeredBefore=${future.toISOString()}`);
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0].username).toBe('alice');
  });

  it('should filter by registeredAfter', async () => {
    await User.deleteMany({});
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // yesterday
    const twoDaysAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000)*2); // two days ago

    const dateUsers = [
      {
        username: 'alice',
        gamesPlayed: 1,
        correctAnswers: 1,
        questionsAnswered: 1,
        registrationDate: twoDaysAgo,
        totalVisits: 0,
        games: [
          { username: 'alice', gameType: 'classical', score: 50, questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 }
        ]
      },
      {
        username: 'bob',
        gamesPlayed: 3,
        correctAnswers: 2,
        questionsAnswered: 2,
        registrationDate: now,
        totalVisits: 0,
        games: [
          { username: 'bob', gameType: 'classical', score: 60, questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 },
          { username: 'bob', gameType: 'classical', score: 40, questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 }
        ]
      }
    ];
    await User.insertMany(dateUsers);

    const res = await request(server).get(`/statistics?registeredAfter=${yesterday.toISOString()}`);
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0].username).toBe('bob');
  });

  it('should combine multiple filters', async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // yesterday
    const twoDaysAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000)*2); // two days ago

    const dateUsers = [
      {
        username: 'alice',
        gamesPlayed: 1,
        correctAnswers: 1,
        questionsAnswered: 1,
        registrationDate: twoDaysAgo,
        totalVisits: 0,
        games: [
          { username: 'alice', gameType: 'classical', score: 50, questionsAnswered: 1, correctAnswers: 1, incorrectAnswers: 0 }
        ]
      },
      {
        username: 'bob',
        gamesPlayed: 3,
        correctAnswers: 2,
        questionsAnswered: 2,
        registrationDate: now,
        totalVisits: 0,
        games: [
          { username: 'bob', gameType: 'classical', score: 100, questionsAnswered: 2, correctAnswers: 2, incorrectAnswers: 0 }
        ]
      }
    ];
    await User.insertMany(dateUsers);

    const res = await request(server).get(`/statistics?gameType=classical&minGames=1&registeredAfter=${yesterday.toISOString()}`);
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0].username).toBe('bob');
  });

  it('should reject invalid sort field', async () => {
    const res = await request(server).get('/statistics?sort=invalid');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid sort field');
  });

  it('should reject invalid order value', async () => {
    const res = await request(server).get('/statistics?order=up');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid sort order');
  });

  it('should reject invalid gameType filter', async () => {
    const res = await request(server).get('/statistics?gameType=foo');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid game type');
  });

  it('should reject non-numeric minGames', async () => {
    const res = await request(server).get('/statistics?minGames=abc');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid minimum games value');
  });

  it('should reject non-numeric minScore', async () => {
    const res = await request(server).get('/statistics?minScore=xyz');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid minimum score value');
  });

  it('should reject invalid registration date formats', async () => {
    const res1 = await request(server).get('/statistics?registeredBefore=not-a-date');
    expect(res1.status).toBe(400);
    expect(res1.body.error).toBe('Invalid registeredBefore date format');

    const res2 = await request(server).get('/statistics?registeredAfter=2025-02-30');
    expect(res2.status).toBe(400);
    expect(res2.body.error).toBe('Invalid registeredAfter date format');
  });

  it('should reject invalid limit and offset values', async () => {
    const badLimit = await request(server).get('/statistics?limit=0');
    expect(badLimit.status).toBe(400);
    expect(badLimit.body.error).toContain('Invalid limit');

    const badOffset = await request(server).get('/statistics?offset=-1');
    expect(badOffset.status).toBe(400);
    expect(badOffset.body.error).toContain('Invalid offset');
  });
});

describe('POST /statistics', () => {
  it('should require username header', async () => {
    const res = await request(server).post('/statistics').send({ gamesPlayed: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Username missing in request');
  });

  it('should reject non-numeric body fields', async () => {
    const user = await User.create({ username: 'tester', gamesPlayed: 0, questionsAnswered: 0, correctAnswers: 0, incorrectAnswers: 0 });
    const res = await request(server)
      .post('/statistics')
      .set('username', 'tester')
      .send({ gamesPlayed: 'NaN' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid input');
  });

  it('should return 404 for unknown user', async () => {
    const res = await request(server)
      .post('/statistics')
      .set('username', 'unknown')
      .send({ gamesPlayed: 5 });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('statistics.errors.userNotFound');
  });

  it('should update user statistics correctly', async () => {
    const user = await User.create({ username: 'updateuser', gamesPlayed: 2, questionsAnswered: 4, correctAnswers: 3, incorrectAnswers: 1 });
    const res = await request(server)
      .post('/statistics')
      .set('username', 'updateuser')
      .send({ gamesPlayed: 3, questionsAnswered: 2, correctAnswers: 1, incorrectAnswers: 1 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ gamesPlayed: 5, questionsAnswered: 6, correctAnswers: 4, incorrectAnswers: 2 });

    const updated = await User.findOne({ username: 'updateuser' });
    expect(updated.gamesPlayed).toBe(5);
    expect(updated.questionsAnswered).toBe(6);
  });
});

describe('POST /recordGame', () => {
  it('should require username header', async () => {
    const res = await request(server).post('/recordGame').send({ gameType: 'classical', score: 10 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Username missing in request');
  });

  it('should return 404 for unknown user', async () => {
    const res = await request(server)
      .post('/recordGame')
      .set('username', 'nouser')
      .send({ gameType: 'classical', score: 10 });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('statistics.errors.userNotFound');
  });

  it('should push new game and increment gamesPlayed', async () => {
    const user = await User.create({ username: 'gamer', gamesPlayed: 0, games: [] });
    const game = { gameType: 'timeTrial', score: 15, questionsAnswered: 5, correctAnswers: 4, incorrectAnswers: 1 };

    const res = await request(server)
      .post('/recordGame')
      .set('username', 'gamer')
      .send(game);

    expect(res.status).toBe(200);
    const updated = await User.findOne({ username: 'gamer' });
    expect(updated.gamesPlayed).toBe(1);
    expect(updated.games[0].score).toBe(15);
  });
});

describe('GET /statistics/:username', () => {
  it('should require currentuser header', async () => {
    const res = await request(server).get('/statistics/alice');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Current user missing in request');
  });

  it('should reject invalid username format', async () => {
    const res = await request(server)
      .get('/statistics/!nv@lid')
      .set('currentuser', 'tester');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid username format');
  });

  it('should return 404 if target user not found', async () => {
    const res = await request(server)
      .get('/statistics/nonexistent')
      .set('currentuser', 'tester');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('statistics.errors.userNotFound');
  });

  it('should return public statistics for visitor', async () => {
    const user = await User.create({ username: 'publicuser', gamesPlayed: 2, registrationDate: new Date(), totalVisits: 0, games: [] });
    const res = await request(server)
      .get('/statistics/publicuser')
      .set('currentuser', 'visitor');

    expect(res.status).toBe(200);
    expect(res.body.isProfileOwner).toBe(false);
    expect(res.body).not.toHaveProperty('recentVisitors');
  });

  it('should return private statistics for owner', async () => {
    const user = await User.create({ username: 'self', gamesPlayed: 1, registrationDate: new Date(), totalVisits: 0, games: [], profileVisits: [{ visitorUsername: 'a', visitDate: new Date() }] });
    const res = await request(server)
      .get('/statistics/self')
      .set('currentuser', 'self');

    expect(res.status).toBe(200);
    expect(res.body.isProfileOwner).toBe(true);
    expect(Array.isArray(res.body.recentVisitors)).toBe(true);
  });
});
