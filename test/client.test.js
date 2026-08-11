import test from 'node:test';
import assert from 'node:assert/strict';

import { ApiError, DeviceClient } from '../src/index.js';

test('createDevice sends POST request with bearer token and JSON body', async () => {
  const calls = [];
  const client = new DeviceClient({
    baseUrl: 'https://api.example.com/',
    token: 'token-123',
    fetch: async (url, options) => {
      calls.push({ url, options });
      return mockJsonResponse(201, { id: 42, name: 'Jane\'s Phone' });
    },
  });

  const result = await client.createDevice({ platform: 'ios', token: 'abc' });

  assert.deepEqual(result, { id: 42, name: "Jane's Phone" });
  assert.equal(calls[0].url, 'https://api.example.com/devices');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer token-123');
  assert.equal(calls[0].options.headers['Content-Type'], 'application/json');
  assert.equal(calls[0].options.body, JSON.stringify({ platform: 'ios', token: 'abc' }));
});

test('updateDevice uses configured PATCH method by default', async () => {
  const calls = [];
  const client = new DeviceClient({
    baseUrl: 'https://api.example.com',
    fetch: async (url, options) => {
      calls.push({ url, options });
      return mockJsonResponse(200, { id: 7, enabled: true });
    },
  });

  await client.updateDevice(7, { enabled: true });

  assert.equal(calls[0].url, 'https://api.example.com/devices/7');
  assert.equal(calls[0].options.method, 'PATCH');
});

test('updateDevice can override method to PUT', async () => {
  const calls = [];
  const client = new DeviceClient({
    baseUrl: 'https://api.example.com',
    fetch: async (url, options) => {
      calls.push({ url, options });
      return mockJsonResponse(200, { id: 9, enabled: false });
    },
  });

  await client.updateDevice(9, { enabled: false }, { method: 'PUT' });

  assert.equal(calls[0].options.method, 'PUT');
});

test('throws ApiError for unauthorized responses', async () => {
  const client = new DeviceClient({
    baseUrl: 'https://api.example.com',
    fetch: async () => mockJsonResponse(401, { error: 'Unauthorized' }),
  });

  await assert.rejects(
    client.createDevice({ token: 'abc' }),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 401);
      assert.deepEqual(error.body, { error: 'Unauthorized' });
      return true;
    }
  );
});

test('supports async token providers', async () => {
  const calls = [];
  const client = new DeviceClient({
    baseUrl: 'https://api.example.com',
    token: async () => 'dynamic-token',
    fetch: async (url, options) => {
      calls.push({ url, options });
      return mockJsonResponse(201, { id: 15 });
    },
  });

  await client.createDevice({ token: 'abc' });

  assert.equal(calls[0].options.headers.Authorization, 'Bearer dynamic-token');
});

function mockJsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    async json() {
      return body;
    },
    async text() {
      return JSON.stringify(body);
    },
  };
}
