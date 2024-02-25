const request = require('supertest');

const API_GATEWAY_URL = 'http://service1:3000';

describe('PUT /state', () => {
    it('should return 400 for invalid state', async () => {
      const res = await request(API_GATEWAY_URL)
        .put('/state')
        .send('INVALID');
  
      expect(res.statusCode).toEqual(400);
      expect(res.text).toEqual('Invalid state');
    });
  });