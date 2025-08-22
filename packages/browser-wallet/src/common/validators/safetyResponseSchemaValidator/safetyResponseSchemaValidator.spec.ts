import { safetyResponseSchemaValidator } from './safetyResponseSchemaValidator.ts';
import { generateNonce } from '../../utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../utils/generateRequestId/generateRequestId.ts';

const createValidSafetyResponse = () => ({
  type: 'GENERATE_DEVICE_KEY' as const,
  kind: 'success' as const,
  deviceId: 'test-device-id',
  timestamp: Date.now(),
  nonce: generateNonce(),
  requestId: generateRequestId(),
  payload: { test: 'data' },
  signature: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
});

test('safetyResponseSchemaValidator should pass validation with valid safety response', () => {
  const validResponse = createValidSafetyResponse();

  expect(() =>
    safetyResponseSchemaValidator(validResponse, 'INVALID SCHEMA'),
  ).not.toThrow();
  expect(safetyResponseSchemaValidator(validResponse, 'INVALID SCHEMA')).toBe(
    true,
  );
});

test('safetyResponseSchemaValidator should fail validation with missing signature', () => {
  const invalidResponse = {
    ...createValidSafetyResponse(),
    signature: undefined,
  } as any;

  expect(() =>
    safetyResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('safetyResponseSchemaValidator should fail validation with invalid signature type', () => {
  const invalidResponse = {
    ...createValidSafetyResponse(),
    signature: 'not-uint8array',
  } as any;

  expect(() =>
    safetyResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('safetyResponseSchemaValidator should fail validation with error kind', () => {
  const errorResponse = {
    ...createValidSafetyResponse(),
    kind: 'error',
  } as any;

  expect(() =>
    safetyResponseSchemaValidator(errorResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('safetyResponseSchemaValidator should fail validation with missing deviceId', () => {
  const invalidResponse = {
    ...createValidSafetyResponse(),
    deviceId: undefined,
  } as any;

  expect(() =>
    safetyResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('safetyResponseSchemaValidator should fail validation with invalid deviceId type', () => {
  const invalidResponse = {
    ...createValidSafetyResponse(),
    deviceId: 123,
  } as any;

  expect(() =>
    safetyResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('safetyResponseSchemaValidator should fail validation with missing nonce', () => {
  const invalidResponse = {
    ...createValidSafetyResponse(),
    nonce: undefined,
  } as any;

  expect(() =>
    safetyResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('safetyResponseSchemaValidator should fail validation with invalid nonce type', () => {
  const invalidResponse = {
    ...createValidSafetyResponse(),
    nonce: 123,
  } as any;

  expect(() =>
    safetyResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('safetyResponseSchemaValidator should fail validation with missing timestamp', () => {
  const invalidResponse = {
    ...createValidSafetyResponse(),
    timestamp: undefined,
  } as any;

  expect(() =>
    safetyResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('safetyResponseSchemaValidator should fail validation with invalid timestamp type', () => {
  const invalidResponse = {
    ...createValidSafetyResponse(),
    timestamp: 'invalid',
  } as any;

  expect(() =>
    safetyResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('safetyResponseSchemaValidator should fail validation with missing requestId', () => {
  const invalidResponse = {
    ...createValidSafetyResponse(),
    requestId: undefined,
  } as any;

  expect(() =>
    safetyResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});
