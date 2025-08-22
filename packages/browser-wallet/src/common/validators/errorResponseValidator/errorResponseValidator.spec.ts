import { errorResponseValidator } from './errorResponseValidator.ts';
import { AnyErr } from '../../../operations/AnyOperation.ts';
import { generateNonce } from '../../utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../utils/generateRequestId/generateRequestId.ts';

const createValidErrorResponse = (): AnyErr => ({
  type: 'START_SESSION',
  kind: 'error',
  deviceId: 'test-device-id',
  timestamp: Date.now(),
  nonce: generateNonce(),
  requestId: generateRequestId(),
  message: 'Some error message',
  terminate: 'session',
});

const createMockEvent = (
  data: AnyErr,
  origin = 'https://trusted.com',
): MessageEvent<AnyErr> =>
  ({
    data,
    origin,
    source: {} as MessageEventSource,
  }) as MessageEvent<AnyErr>;

test('errorResponseValidator should pass validation with valid error response', async () => {
  const validError = createValidErrorResponse();
  const mockEvent = createMockEvent(validError);

  await expect(
    errorResponseValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).resolves.toBe(true);
});

test('errorResponseValidator should pass validation with error response without terminate', async () => {
  const validError = {
    ...createValidErrorResponse(),
    terminate: undefined,
  };
  const mockEvent = createMockEvent(validError);

  await expect(
    errorResponseValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).resolves.toBe(true);
});

test('errorResponseValidator should fail validation with invalid origin', async () => {
  const validError = createValidErrorResponse();
  const mockEvent = createMockEvent(validError, 'https://malicious.com');

  await expect(
    errorResponseValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow('INVALID ORIGIN');
});

test('errorResponseValidator should fail validation with wrong deviceId', async () => {
  const validError = createValidErrorResponse();
  const mockEvent = createMockEvent(validError);

  await expect(
    errorResponseValidator({
      event: mockEvent,
      deviceId: 'different-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow();
});

test('errorResponseValidator should fail validation with invalid nonce', async () => {
  const invalidError = {
    ...createValidErrorResponse(),
    nonce: 123 as any, // Should be string
  };
  const mockEvent = createMockEvent(invalidError);

  await expect(
    errorResponseValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow();
});

test('errorResponseValidator should fail validation with invalid timestamp', async () => {
  const invalidError = {
    ...createValidErrorResponse(),
    timestamp: 'invalid' as any, // Should be number
  };
  const mockEvent = createMockEvent(invalidError);

  await expect(
    errorResponseValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow();
});

test('errorResponseValidator should fail validation with wrong kind', async () => {
  const invalidError = {
    ...createValidErrorResponse(),
    kind: 'success' as any, // Should be 'error'
  };
  const mockEvent = createMockEvent(invalidError);

  await expect(
    errorResponseValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow('Error in schema');
});

test('errorResponseValidator should fail validation with missing message', async () => {
  const invalidError = {
    ...createValidErrorResponse(),
    message: undefined,
  } as any;
  const mockEvent = createMockEvent(invalidError);

  await expect(
    errorResponseValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow('Error in schema');
});

test('errorResponseValidator should fail validation with missing requestId', async () => {
  const invalidError = {
    ...createValidErrorResponse(),
    requestId: undefined,
  } as any;
  const mockEvent = createMockEvent(invalidError);

  await expect(
    errorResponseValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow();
});

test('errorResponseValidator should fail validation with invalid operation type', async () => {
  const invalidError = {
    ...createValidErrorResponse(),
    type: 'INVALID_OPERATION',
  } as any;
  const mockEvent = createMockEvent(invalidError);

  await expect(
    errorResponseValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow('Error in schema');
});
