import { noSessionRequestSchemaValidator } from './noSessionRequestSchemaValidator.ts';
import { generateNonce } from '../../utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../utils/generateRequestId/generateRequestId.ts';

const createValidNoSessionRequest = () => ({
  type: 'START_SESSION' as const,
  deviceId: 'test-device-id',
  timestamp: Date.now(),
  nonce: generateNonce(),
  requestId: generateRequestId(),
  payload: new Uint8Array([1, 2, 3, 4, 5]),
  signature: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
});

test('noSessionRequestSchemaValidator should pass validation with valid no-session request', () => {
  const validRequest = createValidNoSessionRequest();

  expect(() =>
    noSessionRequestSchemaValidator(validRequest, 'INVALID SCHEMA'),
  ).not.toThrow();
  expect(noSessionRequestSchemaValidator(validRequest, 'INVALID SCHEMA')).toBe(
    true,
  );
});

test('noSessionRequestSchemaValidator should fail validation with missing signature', () => {
  const invalidRequest = {
    ...createValidNoSessionRequest(),
    signature: undefined,
  } as any;

  expect(() =>
    noSessionRequestSchemaValidator(invalidRequest, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('noSessionRequestSchemaValidator should fail validation with invalid signature type', () => {
  const invalidRequest = {
    ...createValidNoSessionRequest(),
    signature: 'not-uint8array',
  } as any;

  expect(() =>
    noSessionRequestSchemaValidator(invalidRequest, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('noSessionRequestSchemaValidator should fail validation with missing deviceId', () => {
  const invalidRequest = {
    ...createValidNoSessionRequest(),
    deviceId: undefined,
  } as any;

  expect(() =>
    noSessionRequestSchemaValidator(invalidRequest, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('noSessionRequestSchemaValidator should fail validation with invalid deviceId type', () => {
  const invalidRequest = {
    ...createValidNoSessionRequest(),
    deviceId: 123,
  } as any;

  expect(() =>
    noSessionRequestSchemaValidator(invalidRequest, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('noSessionRequestSchemaValidator should fail validation with missing nonce', () => {
  const invalidRequest = {
    ...createValidNoSessionRequest(),
    nonce: undefined,
  } as any;

  expect(() =>
    noSessionRequestSchemaValidator(invalidRequest, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('noSessionRequestSchemaValidator should fail validation with missing timestamp', () => {
  const invalidRequest = {
    ...createValidNoSessionRequest(),
    timestamp: undefined,
  } as any;

  expect(() =>
    noSessionRequestSchemaValidator(invalidRequest, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('noSessionRequestSchemaValidator should fail validation with missing requestId', () => {
  const invalidRequest = {
    ...createValidNoSessionRequest(),
    requestId: undefined,
  } as any;

  expect(() =>
    noSessionRequestSchemaValidator(invalidRequest, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});
