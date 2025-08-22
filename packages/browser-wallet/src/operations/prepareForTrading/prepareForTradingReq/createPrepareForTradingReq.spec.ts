import { createPrepareForTradingReq } from './createPrepareForTradingReq.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { PrepareForTradingRequestPayload } from '../types/PrepareForTradingPayload.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';

let keyPair: CommunicationKeyPair;

beforeEach(async () => {
  keyPair = await CommunicationKeyPair.create();
});

afterEach(async () => {
  await keyPair.destroy();
});

test('createPrepareForTradingReq should create valid request with full payload', async () => {
  const payload: PrepareForTradingRequestPayload = {
    seed: {
      iv: new Uint8Array([1, 2, 3, 4]),
      salt: new Uint8Array([5, 6, 7, 8]),
      ciphertext: new Uint8Array([9, 10, 11, 12]),
    },
    session: {
      iv: new Uint8Array([13, 14, 15, 16]),
      ciphertext: new Uint8Array([17, 18, 19, 20]),
      ephemeralPublicKey: new Uint8Array([21, 22, 23, 24]),
    },
    deviceKeys: {
      publicKey: new Uint8Array([25, 26, 27, 28]),
      privateKey: new Uint8Array([29, 30, 31, 32]),
    },
  };

  const request = await createPrepareForTradingReq({
    requestId: '123e4567-e89b-12d3-a456-426614174000',
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
    payload,
  });

  expect(request.type).toBe('PREPARE_FOR_TRADING');
  expect(request.payload).toEqual(payload);
  expect(request.requestId).toBe('123e4567-e89b-12d3-a456-426614174000');
  expect(request.deviceId).toBe('test-device-id');
  expect(request.sessionId).toBe('test-session-id');
  expect(request.signature).toBeInstanceOf(Uint8Array);
  expect(request.timestamp).toBeGreaterThan(0);
  expect(request.nonce).toBeDefined();
});

test('createPrepareForTradingReq should create valid signature that can be verified with publicKey', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174001';
  const deviceId = 'test-device-id';
  const sessionId = 'test-session-id';
  const payload: PrepareForTradingRequestPayload = {
    deviceKeys: {
      publicKey: new Uint8Array([1, 2, 3, 4]),
    },
  };

  const request = await createPrepareForTradingReq({
    requestId,
    deviceId,
    keyPair,
    sessionId,
    payload,
  });

  const messageForSign = generateMessageForSign(
    request.payload,
    request.timestamp,
    deviceId,
    requestId,
    request.nonce,
  );

  const isSignatureValid = await keyPair.publicKey.verify(
    messageForSign,
    request.signature,
  );

  expect(isSignatureValid).toBe(true);
});

test('createPrepareForTradingReq should create requests with unique nonces and requestIds', async () => {
  const payload: PrepareForTradingRequestPayload = {
    deviceKeys: { publicKey: new Uint8Array([1, 2, 3, 4]) },
  };

  const request1 = await createPrepareForTradingReq({
    requestId: generateRequestId(),
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
    payload,
  });

  const request2 = await createPrepareForTradingReq({
    requestId: generateRequestId(),
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
    payload,
  });

  expect(request1.nonce).not.toBe(request2.nonce);
  expect(request1.requestId).not.toBe(request2.requestId);
  expect(request1.timestamp).toBeLessThanOrEqual(request2.timestamp);
});

test('createPrepareForTradingReq should create different signatures for different deviceIds', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174002';
  const sessionId = 'test-session-id';
  const payload: PrepareForTradingRequestPayload = {
    deviceKeys: { publicKey: new Uint8Array([1, 2, 3, 4]) },
  };

  const request1 = await createPrepareForTradingReq({
    requestId,
    deviceId: 'device-id-1',
    keyPair,
    sessionId,
    payload,
  });

  const request2 = await createPrepareForTradingReq({
    requestId,
    deviceId: 'device-id-2',
    keyPair,
    sessionId,
    payload,
  });

  expect(request1.signature).not.toEqual(request2.signature);
  expect(request1.deviceId).not.toBe(request2.deviceId);
  expect(request1.nonce).not.toBe(request2.nonce);
});

test('createPrepareForTradingReq signature should fail verification with wrong public key', async () => {
  const wrongKeyPair = await CommunicationKeyPair.create();
  const payload: PrepareForTradingRequestPayload = {
    deviceKeys: { publicKey: new Uint8Array([1, 2, 3, 4]) },
  };

  const request = await createPrepareForTradingReq({
    requestId: '123e4567-e89b-12d3-a456-426614174003',
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
    payload,
  });

  const messageForSign = generateMessageForSign(
    request.payload,
    request.timestamp,
    'test-device-id',
    '123e4567-e89b-12d3-a456-426614174003',
    request.nonce,
  );

  const isSignatureValid = await wrongKeyPair.publicKey.verify(
    messageForSign,
    request.signature,
  );

  expect(isSignatureValid).toBe(false);

  await wrongKeyPair.destroy();
});
