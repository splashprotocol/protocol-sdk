import { createGetExistedDevicePublicKeyRes } from './createGetExistedDevicePublicKeyRes.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { Session } from '../../../common/models/Session/Session.ts';
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

test('createGetExistedDevicePublicKeyRes should create valid response with public key', async () => {
  const payload = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

  const response = await createGetExistedDevicePublicKeyRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174000',
    session: mockSession,
    payload,
  });

  expect(response.type).toBe('GET_EXISTED_DEVICE_PUBLIC_KEY');
  expect(response.kind).toBe('success');
  expect(response.payload).toEqual(payload);
  expect(response.requestId).toBe('123e4567-e89b-12d3-a456-426614174000');
  expect(response.deviceId).toBe('test-device-id');
  expect(response.signature).toBeInstanceOf(Uint8Array);
  expect(response.timestamp).toBeGreaterThan(0);
  expect(response.nonce).toBeDefined();
});

test('createGetExistedDevicePublicKeyRes should create responses with unique nonces and timestamps', async () => {
  const payload = new Uint8Array([1, 2, 3, 4, 5]);

  const response1 = await createGetExistedDevicePublicKeyRes({
    deviceId: 'test-device-id',
    requestId: generateRequestId(),
    session: mockSession,
    payload,
  });

  const response2 = await createGetExistedDevicePublicKeyRes({
    deviceId: 'test-device-id',
    requestId: generateRequestId(),
    session: mockSession,
    payload,
  });

  expect(response1.nonce).not.toBe(response2.nonce);
  expect(response1.requestId).not.toBe(response2.requestId);
  expect(response1.timestamp).toBeLessThanOrEqual(response2.timestamp);
});

test('createGetExistedDevicePublicKeyRes should create valid signature that can be verified', async () => {
  const payload = new Uint8Array([10, 20, 30, 40, 50]);
  const requestId = '123e4567-e89b-12d3-a456-426614174003';
  const deviceId = 'test-device-id';

  const response = await createGetExistedDevicePublicKeyRes({
    deviceId,
    requestId,
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

test('createGetExistedDevicePublicKeyRes should create different signatures for different payloads', async () => {
  const payload1 = new Uint8Array([1, 2, 3]);
  const payload2 = new Uint8Array([4, 5, 6]);
  const requestId = '123e4567-e89b-12d3-a456-426614174004';

  const response1 = await createGetExistedDevicePublicKeyRes({
    deviceId: 'test-device-id',
    requestId,
    session: mockSession,
    payload: payload1,
  });

  const response2 = await createGetExistedDevicePublicKeyRes({
    deviceId: 'test-device-id',
    requestId,
    session: mockSession,
    payload: payload2,
  });

  expect(response1.signature).not.toEqual(response2.signature);
  expect(response1.payload).not.toEqual(response2.payload);
  expect(response1.nonce).not.toBe(response2.nonce);
});

test('createGetExistedDevicePublicKeyRes signature should fail verification with wrong public key', async () => {
  const wrongKeyPair = await CommunicationKeyPair.create();
  const payload = new Uint8Array([100, 200]);

  const response = await createGetExistedDevicePublicKeyRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174006',
    session: mockSession,
    payload,
  });

  const messageForSign = generateMessageForSign(
    response.payload,
    response.timestamp,
    'test-device-id',
    '123e4567-e89b-12d3-a456-426614174006',
    response.nonce,
  );

  const isSignatureValid = await wrongKeyPair.publicKey.verify(
    messageForSign,
    response.signature,
  );

  expect(isSignatureValid).toBe(false);

  await wrongKeyPair.destroy();
});

test('createGetExistedDevicePublicKeyRes should create valid response with undefined payload', async () => {
  const payload = undefined;

  const response = await createGetExistedDevicePublicKeyRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174000',
    session: mockSession,
    payload,
  });

  expect(response.type).toBe('GET_EXISTED_DEVICE_PUBLIC_KEY');
  expect(response.kind).toBe('success');
  expect(response.payload).toBeUndefined();
  expect(response.requestId).toBe('123e4567-e89b-12d3-a456-426614174000');
  expect(response.deviceId).toBe('test-device-id');
  expect(response.signature).toBeInstanceOf(Uint8Array);
  expect(response.timestamp).toBeGreaterThan(0);
  expect(response.nonce).toBeDefined();
});

test('createGetExistedDevicePublicKeyRes should create valid signature for undefined payload', async () => {
  const payload = undefined;
  const requestId = '123e4567-e89b-12d3-a456-426614174007';
  const deviceId = 'test-device-id';

  const response = await createGetExistedDevicePublicKeyRes({
    deviceId,
    requestId,
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
