import { createPrepareForTradingRes } from './createPrepareForTradingRes.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { Session } from '../../../common/models/Session/Session.ts';
import { PrepareForTradingResult } from '../types/PrepareForTradingResult.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';

let keyPair: CommunicationKeyPair;
let mockSession: Session;

beforeEach(async () => {
  keyPair = await CommunicationKeyPair.create();
  mockSession = {
    communicationResponseKeys: {
      privateKey: keyPair.privateKey,
    },
  } as Session;
});

afterEach(async () => {
  await keyPair.destroy();
});

test('createPrepareForTradingRes should create valid response with correct structure', async () => {
  const payload: PrepareForTradingResult = {
    pk: 'test-public-key-hex',
    pkh: 'test-payment-key-hash',
    skh: 'test-stake-key-hash',
  };

  const response = await createPrepareForTradingRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174000',
    session: mockSession,
    payload,
  });

  expect(response.type).toBe('PREPARE_FOR_TRADING');
  expect(response.kind).toBe('success');
  expect(response.payload).toEqual(payload);
  expect(response.requestId).toBe('123e4567-e89b-12d3-a456-426614174000');
  expect(response.deviceId).toBe('test-device-id');
  expect(response.signature).toBeInstanceOf(Uint8Array);
  expect(response.timestamp).toBeGreaterThan(0);
  expect(response.nonce).toBeDefined();
});

test('createPrepareForTradingRes should create responses with unique nonces and requestIds', async () => {
  const payload: PrepareForTradingResult = {
    pk: 'test-public-key-hex',
    pkh: 'test-payment-key-hash',
    skh: 'test-stake-key-hash',
  };

  const response1 = await createPrepareForTradingRes({
    deviceId: 'test-device-id',
    requestId: generateRequestId(),
    session: mockSession,
    payload,
  });

  const response2 = await createPrepareForTradingRes({
    deviceId: 'test-device-id',
    requestId: generateRequestId(),
    session: mockSession,
    payload,
  });

  expect(response1.nonce).not.toBe(response2.nonce);
  expect(response1.requestId).not.toBe(response2.requestId);
  expect(response1.timestamp).toBeLessThanOrEqual(response2.timestamp);
});

test('createPrepareForTradingRes should create valid signature that can be verified with publicKey', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174001';
  const deviceId = 'test-device-id';
  const payload: PrepareForTradingResult = {
    pk: 'test-public-key-hex',
    pkh: 'test-payment-key-hash',
    skh: 'test-stake-key-hash',
  };

  const response = await createPrepareForTradingRes({
    requestId,
    deviceId,
    session: mockSession,
    payload,
  });

  const messageForSign = generateMessageForSign(
    response.payload,
    response.timestamp,
    deviceId,
    requestId,
    response.nonce,
  );

  const isSignatureValid = await keyPair.publicKey.verify(
    messageForSign,
    response.signature,
  );

  expect(isSignatureValid).toBe(true);
  expect(response.signature).toBeInstanceOf(Uint8Array);
  expect(response.signature.length).toBeGreaterThan(0);
});

test('createPrepareForTradingRes should create different signatures for different deviceIds', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174002';
  const payload: PrepareForTradingResult = {
    pk: 'test-public-key-hex',
    pkh: 'test-payment-key-hash',
    skh: 'test-stake-key-hash',
  };

  const response1 = await createPrepareForTradingRes({
    requestId,
    deviceId: 'device-id-1',
    session: mockSession,
    payload,
  });

  const response2 = await createPrepareForTradingRes({
    requestId,
    deviceId: 'device-id-2',
    session: mockSession,
    payload,
  });

  expect(response1.signature).not.toEqual(response2.signature);
  expect(response1.deviceId).not.toBe(response2.deviceId);
  expect(response1.nonce).not.toBe(response2.nonce);
});

test('createPrepareForTradingRes signature should fail verification with wrong public key', async () => {
  const wrongKeyPair = await CommunicationKeyPair.create();
  const payload: PrepareForTradingResult = {
    pk: 'test-public-key-hex',
    pkh: 'test-payment-key-hash',
    skh: 'test-stake-key-hash',
  };

  const response = await createPrepareForTradingRes({
    requestId: '123e4567-e89b-12d3-a456-426614174003',
    deviceId: 'test-device-id',
    session: mockSession,
    payload,
  });

  const messageForSign = generateMessageForSign(
    response.payload,
    response.timestamp,
    'test-device-id',
    '123e4567-e89b-12d3-a456-426614174003',
    response.nonce,
  );

  const isSignatureValid = await wrongKeyPair.publicKey.verify(
    messageForSign,
    response.signature,
  );

  expect(isSignatureValid).toBe(false);

  await wrongKeyPair.destroy();
});
