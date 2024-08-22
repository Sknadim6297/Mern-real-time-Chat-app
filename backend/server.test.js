// server.test.js
const request = require('supertest');
const app = require('./app'); // Your Express app

test('GET /api/endpoint returns 200', async () => {
  const response = await request(app).get('/api/endpoint');
  expect(response.statusCode).toBe(200);
});
