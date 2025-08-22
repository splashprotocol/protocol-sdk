import { createGenerateDeviceKeyReq } from './createGenerateDeviceKeyReq.ts';
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

test('createGenerateDeviceKeyReq should create valid request with correct structure', async () => {
  const request = await createGenerateDeviceKeyReq({
    requestId: '123e4567-e89b-12d3-a456-426614174000',
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
  });

  expect(request.type).toBe('GENERATE_DEVICE_KEY');
  expect(request.payload).toBeUndefined();
  expect(request.requestId).toBe('123e4567-e89b-12d3-a456-426614174000');
  expect(request.deviceId).toBe('test-device-id');
  expect(request.sessionId).toBe('test-session-id');
  expect(request.signature).toBeInstanceOf(Uint8Array);
  expect(request.timestamp).toBeGreaterThan(0);
  expect(request.nonce).toBeDefined();
});

test('createGenerateDeviceKeyReq should create requests with unique nonces and requestIds', async () => {
  const request1 = await createGenerateDeviceKeyReq({
    requestId: generateRequestId(),
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
  });

  const request2 = await createGenerateDeviceKeyReq({
    requestId: generateRequestId(),
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
  });

  expect(request1.nonce).not.toBe(request2.nonce);
  expect(request1.requestId).not.toBe(request2.requestId);
  expect(request1.timestamp).toBeLessThanOrEqual(request2.timestamp);
});

test('createGenerateDeviceKeyReq should create valid signature that can be verified with publicKey', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174003';
  const deviceId = 'test-device-id';
  const sessionId = 'test-session-id';

  const request = await createGenerateDeviceKeyReq({
    requestId,
    deviceId,
    keyPair,
    sessionId,
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
  expect(request.signature).toBeInstanceOf(Uint8Array);
  expect(request.signature.length).toBeGreaterThan(0);
});

test('createGenerateDeviceKeyReq should create different signatures for different deviceIds', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174004';
  const sessionId = 'test-session-id';

  const request1 = await createGenerateDeviceKeyReq({
    requestId,
    deviceId: 'device-id-1',
    keyPair,
    sessionId,
  });

  const request2 = await createGenerateDeviceKeyReq({
    requestId,
    deviceId: 'device-id-2', // Different deviceId
    keyPair,
    sessionId,
  });

  expect(request1.signature).not.toEqual(request2.signature);
  expect(request1.deviceId).not.toBe(request2.deviceId);
  expect(request1.nonce).not.toBe(request2.nonce);
});

test('createGenerateDeviceKeyReq signature should fail verification with wrong public key', async () => {
  const wrongKeyPair = await CommunicationKeyPair.create();

  const request = await createGenerateDeviceKeyReq({
    requestId: '123e4567-e89b-12d3-a456-426614174006',
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
  });

  const messageForSign = generateMessageForSign(
    request.payload,
    request.timestamp,
    'test-device-id',
    '123e4567-e89b-12d3-a456-426614174006',
    request.nonce,
  );

  const isSignatureValid = await wrongKeyPair.publicKey.verify(
    messageForSign,
    request.signature,
  );

  expect(isSignatureValid).toBe(false);

  await wrongKeyPair.destroy();
});
