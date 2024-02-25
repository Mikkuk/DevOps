const request = require('supertest');

const API_GATEWAY_URL = 'http://monitor:8087';

describe('Monitor service', () => {
  it('should return all messages registered with Monitor service', async () => {
    const res = await request(API_GATEWAY_URL).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toEqual('text/plain');
  });

});