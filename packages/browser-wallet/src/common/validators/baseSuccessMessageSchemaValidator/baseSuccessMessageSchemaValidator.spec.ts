import { baseSuccessMessageSchemaValidator } from './baseSuccessMessageSchemaValidator.ts';
import { generateNonce } from '../../utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../utils/generateRequestId/generateRequestId.ts';

const createValidSuccessMessage = () => ({
  type: 'READY' as const,
  kind: 'success' as const,
  deviceId: 'test-device-id',
  timestamp: Date.now(),
  nonce: generateNonce(),
  requestId: generateRequestId(),
  payload: undefined,
});

test('baseSuccessMessageSchemaValidator should pass validation with valid success message', () => {
  const validMessage = createValidSuccessMessage();

  expect(() =>
    baseSuccessMessageSchemaValidator(validMessage, 'INVALID SCHEMA'),
  ).not.toThrow();
  expect(
    baseSuccessMessageSchemaValidator(validMessage, 'INVALID SCHEMA'),
  ).toBe(true);
});

test('baseSuccessMessageSchemaValidator should fail validation with error message', () => {
  const errorMessage = {
    ...createValidSuccessMessage(),
    kind: 'error',
  } as any;

  expect(() =>
    baseSuccessMessageSchemaValidator(errorMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseSuccessMessageSchemaValidator should fail validation with missing deviceId', () => {
  const invalidMessage = {
    ...createValidSuccessMessage(),
    deviceId: undefined,
  } as any;

  expect(() =>
    baseSuccessMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseSuccessMessageSchemaValidator should fail validation with invalid deviceId type', () => {
  const invalidMessage = {
    ...createValidSuccessMessage(),
    deviceId: 123,
  } as any;

  expect(() =>
    baseSuccessMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseSuccessMessageSchemaValidator should fail validation with missing nonce', () => {
  const invalidMessage = {
    ...createValidSuccessMessage(),
    nonce: undefined,
  } as any;

  expect(() =>
    baseSuccessMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseSuccessMessageSchemaValidator should fail validation with invalid nonce type', () => {
  const invalidMessage = {
    ...createValidSuccessMessage(),
    nonce: 123,
  } as any;

  expect(() =>
    baseSuccessMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseSuccessMessageSchemaValidator should fail validation with missing timestamp', () => {
  const invalidMessage = {
    ...createValidSuccessMessage(),
    timestamp: undefined,
  } as any;

  expect(() =>
    baseSuccessMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseSuccessMessageSchemaValidator should fail validation with invalid timestamp type', () => {
  const invalidMessage = {
    ...createValidSuccessMessage(),
    timestamp: 'invalid',
  } as any;

  expect(() =>
    baseSuccessMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseSuccessMessageSchemaValidator should fail validation with missing requestId', () => {
  const invalidMessage = {
    ...createValidSuccessMessage(),
    requestId: undefined,
  } as any;

  expect(() =>
    baseSuccessMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});

test('baseSuccessMessageSchemaValidator should fail validation with invalid operation type', () => {
  const invalidMessage = {
    ...createValidSuccessMessage(),
    type: 'INVALID_OPERATION',
  } as any;

  expect(() =>
    baseSuccessMessageSchemaValidator(invalidMessage, 'INVALID SCHEMA'),
  ).toThrow('INVALID SCHEMA');
});
