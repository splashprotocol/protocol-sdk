import { createSetThemeReq } from './createSetThemeReq.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { Theme } from '../types/Theme.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';

let keyPair: CommunicationKeyPair;

beforeEach(async () => {
  keyPair = await CommunicationKeyPair.create();
});

afterEach(async () => {
  await keyPair.destroy();
});

test('createSetThemeReq should create valid request with light theme', async () => {
  const payload: Theme = 'light';

  const request = await createSetThemeReq({
    requestId: '123e4567-e89b-12d3-a456-426614174000',
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
    payload
  });

  expect(request.type).toBe('SET_THEME');
  expect(request.payload).toBe(payload);
  expect(request.requestId).toBe('123e4567-e89b-12d3-a456-426614174000');
  expect(request.deviceId).toBe('test-device-id');
  expect(request.sessionId).toBe('test-session-id');
  expect(request.signature).toBeInstanceOf(Uint8Array);
  expect(request.timestamp).toBeGreaterThan(0);
  expect(request.nonce).toBeDefined();
});

test('createSetThemeReq should create valid signature that can be verified with publicKey', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174001';
  const deviceId = 'test-device-id';
  const sessionId = 'test-session-id';
  const payload: Theme = 'dark';

  const request = await createSetThemeReq({
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

test('createSetThemeReq should create different signatures for different themes', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174002';
  const deviceId = 'test-device-id';
  const sessionId = 'test-session-id';

  const request1 = await createSetThemeReq({
    requestId,
    deviceId,
    keyPair,
    sessionId,
    payload: 'light'
  });

  const request2 = await createSetThemeReq({
    requestId,
    deviceId,
    keyPair,
    sessionId,
    payload: 'dark'
  });

  expect(request1.signature).not.toEqual(request2.signature);
  expect(request1.payload).not.toBe(request2.payload);
  expect(request1.nonce).not.toBe(request2.nonce);
});

test('createSetThemeReq signature should fail verification with wrong public key', async () => {
  const wrongKeyPair = await CommunicationKeyPair.create();
  
  const request = await createSetThemeReq({
    requestId: '123e4567-e89b-12d3-a456-426614174003',
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
    payload: 'light'
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