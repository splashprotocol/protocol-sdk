import { errorMessageSchemaValidator } from './errorMessageSchemaValidator.ts';
import { generateNonce } from '../../utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../utils/generateRequestId/generateRequestId.ts';

test('errorMessageSchemaValidator should pass validation with valid error message', () => {
  const validErrorMessage = {
    requestId: generateRequestId(),
    type: 'SIGN_DATA',
    timestamp: Date.now(),
    kind: 'error',
    message: 'Test error message',
    deviceId: 'test-device-id',
    nonce: generateNonce()
  } as any;

  expect(() => {
    errorMessageSchemaValidator(validErrorMessage, 'TEST ERROR');
  }).not.toThrow();
});

test('errorMessageSchemaValidator should fail validation with wrong kind', () => {
  const invalidMessage = {
    requestId: generateRequestId(),
    type: 'SIGN_DATA',
    timestamp: Date.now(),
    kind: 'success',
    message: 'Test error message',
    deviceId: 'test-device-id',
    nonce: generateNonce()
  } as any;

  expect(() => {
    errorMessageSchemaValidator(invalidMessage, 'TEST ERROR');
  }).toThrow('TEST ERROR');
});

test('errorMessageSchemaValidator should fail validation with missing kind', () => {
  const invalidMessage = {
    requestId: generateRequestId(),
    type: 'SIGN_DATA',
    timestamp: Date.now(),
    message: 'Test error message',
    deviceId: 'test-device-id',
    nonce: generateNonce()
  } as any;

  expect(() => {
    errorMessageSchemaValidator(invalidMessage, 'TEST ERROR');
  }).toThrow('TEST ERROR');
});

test('errorMessageSchemaValidator should fail validation with missing deviceId', () => {
  const invalidMessage = {
    requestId: generateRequestId(),
    type: 'SIGN_DATA',
    timestamp: Date.now(),
    kind: 'error',
    message: 'Test error message',
    nonce: generateNonce()
  } as any;

  expect(() => {
    errorMessageSchemaValidator(invalidMessage, 'TEST ERROR');
  }).toThrow('TEST ERROR');
});

test('errorMessageSchemaValidator should fail validation with missing nonce', () => {
  const invalidMessage = {
    requestId: generateRequestId(),
    type: 'SIGN_DATA',
    timestamp: Date.now(),
    kind: 'error',
    message: 'Test error message',
    deviceId: 'test-device-id'
  } as any;

  expect(() => {
    errorMessageSchemaValidator(invalidMessage, 'TEST ERROR');
  }).toThrow('TEST ERROR');
});

test('errorMessageSchemaValidator should fail validation with missing timestamp', () => {
  const invalidMessage = {
    requestId: generateRequestId(),
    type: 'SIGN_DATA',
    kind: 'error',
    message: 'Test error message',
    deviceId: 'test-device-id',
    nonce: generateNonce()
  } as any;

  expect(() => {
    errorMessageSchemaValidator(invalidMessage, 'TEST ERROR');
  }).toThrow('TEST ERROR');
});

test('errorMessageSchemaValidator should fail validation with missing requestId', () => {
  const invalidMessage = {
    type: 'SIGN_DATA',
    timestamp: Date.now(),
    kind: 'error',
    message: 'Test error message',
    deviceId: 'test-device-id',
    nonce: generateNonce()
  } as any;

  expect(() => {
    errorMessageSchemaValidator(invalidMessage, 'TEST ERROR');
  }).toThrow('TEST ERROR');
});

test('errorMessageSchemaValidator should fail validation with invalid operation type', () => {
  const invalidMessage = {
    requestId: generateRequestId(),
    type: 'INVALID_OPERATION',
    timestamp: Date.now(),
    kind: 'error',
    message: 'Test error message',
    deviceId: 'test-device-id',
    nonce: generateNonce()
  } as any;

  expect(() => {
    errorMessageSchemaValidator(invalidMessage, 'TEST ERROR');
  }).toThrow('TEST ERROR');
});

test('errorMessageSchemaValidator should use custom error message', () => {
  const invalidMessage = {
    kind: 'success'
  } as any;

  expect(() => {
    errorMessageSchemaValidator(invalidMessage, 'CUSTOM ERROR MESSAGE');
  }).toThrow('CUSTOM ERROR MESSAGE');
});
