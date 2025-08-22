import { baseMessageSchemaValidator } from './baseMessageSchemaValidator.ts';
import { generateNonce } from '../../utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../utils/generateRequestId/generateRequestId.ts';

const createValidMessage = () => ({
  type: 'READY',
  kind: 'success',
  deviceId: 'test-device-id',
  timestamp: Date.now(),
  nonce: generateNonce(),
  requestId: generateRequestId(),
  payload: undefined,
});

test('baseMessageSchemaValidator should pass validation with valid message', () => {
  const validMessage = createValidMessage();

  expect(() =>
    baseMessageSchemaValidator(validMessage, 'INVALID SCHEMA'),
  ).not.toThrow();
  expect(baseMessageSchemaValidator(validMessage, 'INVALID SCHEMA')).toBe(true);
});

test('baseMessageSchemaValidator should fail validation with missing deviceId', () => {
  const invalidMessage = {
    ...createValidMessage(),
    deviceId: undefined,
  } as any;

  expect(() =>
    baseMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseMessageSchemaValidator should fail validation with invalid deviceId type', () => {
  const invalidMessage = {
    ...createValidMessage(),
    deviceId: 123,
  } as any;

  expect(() =>
    baseMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseMessageSchemaValidator should fail validation with missing nonce', () => {
  const invalidMessage = {
    ...createValidMessage(),
    nonce: undefined,
  } as any;

  expect(() =>
    baseMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseMessageSchemaValidator should fail validation with invalid nonce type', () => {
  const invalidMessage = {
    ...createValidMessage(),
    nonce: 123,
  } as any;

  expect(() =>
    baseMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseMessageSchemaValidator should fail validation with missing timestamp', () => {
  const invalidMessage = {
    ...createValidMessage(),
    timestamp: undefined,
  } as any;

  expect(() =>
    baseMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseMessageSchemaValidator should fail validation with invalid timestamp type', () => {
  const invalidMessage = {
    ...createValidMessage(),
    timestamp: 'invalid',
  } as any;

  expect(() =>
    baseMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseMessageSchemaValidator should fail validation with missing requestId', () => {
  const invalidMessage = {
    ...createValidMessage(),
    requestId: undefined,
  } as any;

  expect(() =>
    baseMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseMessageSchemaValidator should fail validation with invalid requestId type', () => {
  const invalidMessage = {
    ...createValidMessage(),
    requestId: 123,
  } as any;

  expect(() =>
    baseMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseMessageSchemaValidator should fail validation with invalid operation type', () => {
  const invalidMessage = {
    ...createValidMessage(),
    type: 'INVALID_OPERATION',
  } as any;

  expect(() =>
    baseMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});
