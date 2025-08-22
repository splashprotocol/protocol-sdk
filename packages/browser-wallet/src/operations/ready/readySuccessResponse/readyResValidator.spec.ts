import { readyResValidator } from './readyResValidator.ts';
import { ReadyRes } from '../types/ReadyRes.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';

const createValidReadyRes = (): ReadyRes => ({
  type: 'READY',
  kind: 'success',
  deviceId: 'test-device-id',
  timestamp: Date.now(),
  nonce: generateNonce(),
  requestId: generateRequestId(),
  payload: undefined,
});

const createMockEvent = (
  data: ReadyRes,
  origin = 'https://trusted.com',
): MessageEvent<ReadyRes> =>
  ({
    data,
    origin,
    source: {} as MessageEventSource,
  }) as MessageEvent<ReadyRes>;

test('readyResValidator should pass validation with valid ReadyRes', async () => {
  const validResponse = createValidReadyRes();
  const mockEvent = createMockEvent(validResponse);

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).resolves.toBe(true);
});

test('readyResValidator should fail validation with wrong operation type', async () => {
  const invalidResponse = {
    ...createValidReadyRes(),
    type: 'INVALID_TYPE' as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow('INVALID READY RESPONSE SCHEMA');
});

test('readyResValidator should fail validation with non-undefined payload', async () => {
  const invalidResponse = {
    ...createValidReadyRes(),
    payload: 'should-be-undefined' as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow('INVALID READY RESPONSE SCHEMA');
});

test('readyResValidator should fail validation with wrong deviceId', async () => {
  const validResponse = createValidReadyRes();
  const mockEvent = createMockEvent(validResponse);

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'different-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow();
});

test('readyResValidator should fail validation with invalid origin', async () => {
  const validResponse = createValidReadyRes();
  const mockEvent = createMockEvent(validResponse, 'https://malicious.com');

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow('INVALID ORIGIN');
});

test('readyResValidator should fail validation with invalid source', async () => {
  const validResponse = createValidReadyRes();
  const mockEvent = createMockEvent(validResponse);
  const differentSource = {} as MessageEventSource;

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: differentSource,
    }),
  ).rejects.toThrow('INVALID SOURCE');
});

test('readyResValidator should fail validation with missing kind field', async () => {
  const invalidResponse = {
    ...createValidReadyRes(),
    kind: undefined as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow('INVALID READY RESPONSE SCHEMA');
});

test('readyResValidator should fail validation with wrong kind value', async () => {
  const invalidResponse = {
    ...createValidReadyRes(),
    kind: 'error' as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow('INVALID READY RESPONSE SCHEMA');
});

test('readyResValidator should fail validation with invalid timestamp type', async () => {
  const invalidResponse = {
    ...createValidReadyRes(),
    timestamp: 'invalid-timestamp' as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow();
});

test('readyResValidator should fail validation with timestamp older than MAX_DELAY', async () => {
  const oldTimestamp = Date.now() - 6000; // 6 seconds ago (MAX_DELAY is 5000ms)
  const invalidResponse = {
    ...createValidReadyRes(),
    timestamp: oldTimestamp,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow('INVALID TIMESTAMP');
});

test('readyResValidator should fail validation with future timestamp', async () => {
  const futureTimestamp = Date.now() + 1000; // 1 second in the future
  const invalidResponse = {
    ...createValidReadyRes(),
    timestamp: futureTimestamp,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow('INVALID TIMESTAMP');
});

test('readyResValidator should pass validation with timestamp within MAX_DELAY', async () => {
  const recentTimestamp = Date.now() - 3000; // 3 seconds ago (within MAX_DELAY of 5000ms)
  const validResponse = {
    ...createValidReadyRes(),
    timestamp: recentTimestamp,
  };
  const mockEvent = createMockEvent(validResponse);

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).resolves.toBe(true);
});

test('readyResValidator should pass validation with multiple valid origins', async () => {
  const validResponse = createValidReadyRes();
  const mockEvent = createMockEvent(
    validResponse,
    'https://staging.trusted.com',
  );

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com', 'https://staging.trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).resolves.toBe(true);
});

test('readyResValidator should handle null expectedSource', async () => {
  const validResponse = createValidReadyRes();
  const mockEvent = {
    data: validResponse,
    origin: 'https://trusted.com',
    source: null,
  } as MessageEvent<ReadyRes>;

  await expect(
    readyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: null,
    }),
  ).resolves.toBe(true);
});
