import { noSessionResponseSchemaValidator } from './noSessionResponseSchemaValidator.ts';
import { generateNonce } from '../../utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../utils/generateRequestId/generateRequestId.ts';

const createValidNoSessionResponse = () => ({
  type: 'START_SESSION' as const,
  kind: 'success' as const,
  deviceId: 'test-device-id',
  timestamp: Date.now(),
  nonce: generateNonce(),
  requestId: generateRequestId(),
  payload: new Uint8Array([1, 2, 3, 4, 5]),
  signature: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
  sessionId: 'test-session-id',
});

test('noSessionResponseSchemaValidator should pass validation with valid no-session response', () => {
  const validResponse = createValidNoSessionResponse();

  expect(() =>
    noSessionResponseSchemaValidator(validResponse, 'INVALID SCHEMA'),
  ).not.toThrow();
  expect(
    noSessionResponseSchemaValidator(validResponse, 'INVALID SCHEMA'),
  ).toBe(true);
});

test('noSessionResponseSchemaValidator should fail validation with missing signature', () => {
  const invalidResponse = {
    ...createValidNoSessionResponse(),
    signature: undefined,
  } as any;

  expect(() =>
    noSessionResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('noSessionResponseSchemaValidator should fail validation with invalid signature type', () => {
  const invalidResponse = {
    ...createValidNoSessionResponse(),
    signature: 'not-uint8array',
  } as any;

  expect(() =>
    noSessionResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('noSessionResponseSchemaValidator should fail validation with missing sessionId', () => {
  const invalidResponse = {
    ...createValidNoSessionResponse(),
    sessionId: undefined,
  } as any;

  expect(() =>
    noSessionResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('noSessionResponseSchemaValidator should fail validation with invalid sessionId type', () => {
  const invalidResponse = {
    ...createValidNoSessionResponse(),
    sessionId: 123,
  } as any;

  expect(() =>
    noSessionResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('noSessionResponseSchemaValidator should fail validation with error kind', () => {
  const errorResponse = {
    ...createValidNoSessionResponse(),
    kind: 'error',
  } as any;

  expect(() =>
    noSessionResponseSchemaValidator(errorResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('noSessionResponseSchemaValidator should fail validation with missing deviceId', () => {
  const invalidResponse = {
    ...createValidNoSessionResponse(),
    deviceId: undefined,
  } as any;

  expect(() =>
    noSessionResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('noSessionResponseSchemaValidator should fail validation with missing nonce', () => {
  const invalidResponse = {
    ...createValidNoSessionResponse(),
    nonce: undefined,
  } as any;

  expect(() =>
    noSessionResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('noSessionResponseSchemaValidator should fail validation with missing timestamp', () => {
  const invalidResponse = {
    ...createValidNoSessionResponse(),
    timestamp: undefined,
  } as any;

  expect(() =>
    noSessionResponseSchemaValidator(invalidResponse, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});
