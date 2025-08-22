import { createSignDataReq } from './createSignDataReq.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';

let keyPair: CommunicationKeyPair;

beforeEach(async () => {
  keyPair = await CommunicationKeyPair.create();
});

afterEach(async () => {
  await keyPair.destroy();
});

test('createSignDataReq should create valid request with correct structure', async () => {
  const payload = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  const request = await createSignDataReq({
    requestId: '123e4567-e89b-12d3-a456-426614174000',
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
    payload
  });

  expect(request.type).toBe('SIGN_DATA');
  expect(request.payload).toEqual(payload);
  expect(request.requestId).toBe('123e4567-e89b-12d3-a456-426614174000');
  expect(request.deviceId).toBe('test-device-id');
  expect(request.sessionId).toBe('test-session-id');
  expect(request.signature).toBeInstanceOf(Uint8Array);
  expect(request.timestamp).toBeGreaterThan(0);
  expect(request.nonce).toBeDefined();
});

test('createSignDataReq should create valid signature that can be verified with publicKey', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174001';
  const deviceId = 'test-device-id';
  const sessionId = 'test-session-id';
  const payload = new Uint8Array([1, 2, 3, 4, 5]);

  const request = await createSignDataReq({
    requestId,
    deviceId,
    keyPair,
    sessionId,
    payload
  });

  const messageForSign = generateMessageForSign(
    request.payload,
    request.timestamp,
    deviceId,
    requestId,
    request.nonce
  );

  const isSignatureValid = await keyPair.publicKey.verify(
    messageForSign,
    request.signature
  );

  expect(isSignatureValid).toBe(true);
});

test('createSignDataReq should create requests with unique nonces and requestIds', async () => {
  const payload = new Uint8Array([1, 2, 3, 4, 5]);

  const request1 = await createSignDataReq({
    requestId: generateRequestId(),
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
    payload
  });

  const request2 = await createSignDataReq({
    requestId: generateRequestId(),
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
    payload
  });

  expect(request1.nonce).not.toBe(request2.nonce);
  expect(request1.requestId).not.toBe(request2.requestId);
  expect(request1.timestamp).toBeLessThanOrEqual(request2.timestamp);
});

test('createSignDataReq should create different signatures for different payloads', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174002';
  const deviceId = 'test-device-id';
  const sessionId = 'test-session-id';

  const request1 = await createSignDataReq({
    requestId,
    deviceId,
    keyPair,
    sessionId,
    payload: new Uint8Array([1, 2, 3, 4])
  });

  const request2 = await createSignDataReq({
    requestId,
    deviceId,
    keyPair,
    sessionId,
    payload: new Uint8Array([5, 6, 7, 8])
  });

  expect(request1.signature).not.toEqual(request2.signature);
  expect(request1.payload).not.toEqual(request2.payload);
  expect(request1.nonce).not.toBe(request2.nonce);
});

test('createSignDataReq signature should fail verification with wrong public key', async () => {
  const wrongKeyPair = await CommunicationKeyPair.create();
  const payload = new Uint8Array([1, 2, 3, 4, 5]);
  
  const request = await createSignDataReq({
    requestId: '123e4567-e89b-12d3-a456-426614174003',
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
    payload
  });

  const messageForSign = generateMessageForSign(
    request.payload,
    request.timestamp,
    'test-device-id',
    '123e4567-e89b-12d3-a456-426614174003',
    request.nonce
  );

  const isSignatureValid = await wrongKeyPair.publicKey.verify(
    messageForSign,
    request.signature
  );

  expect(isSignatureValid).toBe(false);
  
  await wrongKeyPair.destroy();
});