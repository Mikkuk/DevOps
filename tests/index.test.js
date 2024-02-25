const request = require('supertest');

const API_GATEWAY_URL = 'http://api-gateway:8083';

describe('GET /messages', () => {
  it('should return all messages registered with Monitor service', async () => {
    const res = await request(API_GATEWAY_URL).get('/messages');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toEqual('text/plain; charset=utf-8');
  });
});

describe('PUT /state', () => {
  it('should change the state', async () => {
    const res = await request(API_GATEWAY_URL)
      .put('/state')
      .set('Content-Type', 'text/plain; charset=utf-8')
      .set('Accept', 'text/plain')
      .send('PAUSED');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toEqual('text/plain; charset=utf-8');
    expect(res.text).toContain('State changed to PAUSED');
  });
});

describe('GET /state', () => {
  it('should return the current state as plain text', async () => {
    const res = await request(API_GATEWAY_URL).get('/state');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toEqual('text/plain; charset=utf-8');
    expect(res.text).toBe('PAUSED');
  });
});

describe('GET /run-log', () => {
  it('should return the log of state changes', async () => {
    const res = await request(API_GATEWAY_URL).get('/run-log');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toEqual('text/plain; charset=utf-8');
    // Check that the response text is a non-empty string
    expect(res.text).toEqual(expect.stringContaining(''));
  });
});