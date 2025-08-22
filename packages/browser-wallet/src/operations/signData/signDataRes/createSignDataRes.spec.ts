import { createSignDataRes } from './createSignDataRes.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { Session } from '../../../common/models/Session/Session.ts';
import { DataSignature } from '../types/DataSignature.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';

let keyPair: CommunicationKeyPair;
let mockSession: Session;

beforeEach(async () => {
  keyPair = await CommunicationKeyPair.create();
  mockSession = {
    communicationResponseKeys: {
      privateKey: keyPair.privateKey
    }
  } as Session;
});

afterEach(async () => {
  await keyPair.destroy();
});

test('createSignDataRes should create valid response with correct structure', async () => {
  const payload: DataSignature = {
    signature: '304502210098a1b2c3d4e5f6071819202122232425262728293031323334353637383940414243440220556677889900aabbccddeeff112233445566778899aabbccddeeff1122334455',
    publicKey: 'a1b2c3d4e5f6071819202122232425262728293031323334353637383940414243'
  };

  const response = await createSignDataRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174000',
    session: mockSession,
    payload
  });

  expect(response.type).toBe('SIGN_DATA');
  expect(response.kind).toBe('success');
  expect(response.payload).toEqual(payload);
  expect(response.requestId).toBe('123e4567-e89b-12d3-a456-426614174000');
  expect(response.deviceId).toBe('test-device-id');
  expect(response.signature).toBeInstanceOf(Uint8Array);
  expect(response.timestamp).toBeGreaterThan(0);
  expect(response.nonce).toBeDefined();
});

test('createSignDataRes should create responses with unique nonces and requestIds', async () => {
  const payload: DataSignature = {
    signature: 'test-signature-hex',
    publicKey: 'test-public-key-hex'
  };

  const response1 = await createSignDataRes({
    deviceId: 'test-device-id',
    requestId: generateRequestId(),
    session: mockSession,
    payload
  });

  const response2 = await createSignDataRes({
    deviceId: 'test-device-id',
    requestId: generateRequestId(),
    session: mockSession,
    payload
  });

  expect(response1.nonce).not.toBe(response2.nonce);
  expect(response1.requestId).not.toBe(response2.requestId);
  expect(response1.timestamp).toBeLessThanOrEqual(response2.timestamp);
});

test('createSignDataRes should create valid signature that can be verified with publicKey', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174001';
  const deviceId = 'test-device-id';
  const payload: DataSignature = {
    signature: 'test-signature-hex',
    publicKey: 'test-public-key-hex'
  };

  const response = await createSignDataRes({
    requestId,
    deviceId,
    session: mockSession,
    payload
  });

  const messageForSign = generateMessageForSign(
    response.payload,
    response.timestamp,
    deviceId,
    requestId,
    response.nonce
  );

  const isSignatureValid = await keyPair.publicKey.verify(
    messageForSign,
    response.signature
  );

  expect(isSignatureValid).toBe(true);
  expect(response.signature).toBeInstanceOf(Uint8Array);
  expect(response.signature.length).toBeGreaterThan(0);
});

test('createSignDataRes should create different signatures for different deviceIds', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174002';
  const payload: DataSignature = {
    signature: 'test-signature-hex',
    publicKey: 'test-public-key-hex'
  };

  const response1 = await createSignDataRes({
    requestId,
    deviceId: 'device-id-1',
    session: mockSession,
    payload
  });

  const response2 = await createSignDataRes({
    requestId,
    deviceId: 'device-id-2',
    session: mockSession,
    payload
  });

  expect(response1.signature).not.toEqual(response2.signature);
  expect(response1.deviceId).not.toBe(response2.deviceId);
  expect(response1.nonce).not.toBe(response2.nonce);
});

test('createSignDataRes signature should fail verification with wrong public key', async () => {
  const wrongKeyPair = await CommunicationKeyPair.create();
  const payload: DataSignature = {
    signature: 'test-signature-hex',
    publicKey: 'test-public-key-hex'
  };

  const response = await createSignDataRes({
    requestId: '123e4567-e89b-12d3-a456-426614174003',
    deviceId: 'test-device-id',
    session: mockSession,
    payload
  });

  const messageForSign = generateMessageForSign(
    response.payload,
    response.timestamp,
    'test-device-id',
    '123e4567-e89b-12d3-a456-426614174003',
    response.nonce
  );

  const isSignatureValid = await wrongKeyPair.publicKey.verify(
    messageForSign,
    response.signature
  );

  expect(isSignatureValid).toBe(false);

  await wrongKeyPair.destroy();
});