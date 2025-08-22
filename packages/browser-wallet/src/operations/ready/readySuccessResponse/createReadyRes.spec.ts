import { createReadyRes } from './createReadyRes.ts';

test('createReadyRes should create valid response with correct structure', () => {
  const deviceId = 'test-device-id';
  const response = createReadyRes(deviceId);

  expect(response.type).toBe('READY');
  expect(response.kind).toBe('success');
  expect(response.payload).toBeUndefined();
  expect(response.deviceId).toBe(deviceId);
  expect(response.requestId).toBeDefined();
  expect(response.timestamp).toBeGreaterThan(0);
  expect(response.nonce).toBeDefined();
});

test('createReadyRes should create responses with unique nonces and requestIds', () => {
  const response1 = createReadyRes('test-device-id');
  const response2 = createReadyRes('test-device-id');

  expect(response1.nonce).not.toBe(response2.nonce);
  expect(response1.requestId).not.toBe(response2.requestId);
  expect(response1.timestamp).toBeLessThanOrEqual(response2.timestamp);
});

test('createReadyRes should create different responses for different deviceIds', () => {
  const response1 = createReadyRes('device-id-1');
  const response2 = createReadyRes('device-id-2');

  expect(response1.deviceId).not.toBe(response2.deviceId);
  expect(response1.nonce).not.toBe(response2.nonce);
  expect(response1.requestId).not.toBe(response2.requestId);
});

test('createReadyRes should create response with proper timestamp ordering', () => {
  const before = Date.now();
  const response = createReadyRes('test-device-id');
  const after = Date.now();

  expect(response.timestamp).toBeGreaterThanOrEqual(before);
  expect(response.timestamp).toBeLessThanOrEqual(after);
});

test('createReadyRes should create response with all required fields', () => {
  const response = createReadyRes('test-device-id');

  expect(response).toHaveProperty('type');
  expect(response).toHaveProperty('kind');
  expect(response).toHaveProperty('payload');
  expect(response).toHaveProperty('deviceId');
  expect(response).toHaveProperty('requestId');
  expect(response).toHaveProperty('timestamp');
  expect(response).toHaveProperty('nonce');
});

test('createReadyRes should always have undefined payload', () => {
  const response1 = createReadyRes('test-device-id-1');
  const response2 = createReadyRes('test-device-id-2');

  expect(response1.payload).toBeUndefined();
  expect(response2.payload).toBeUndefined();
});
