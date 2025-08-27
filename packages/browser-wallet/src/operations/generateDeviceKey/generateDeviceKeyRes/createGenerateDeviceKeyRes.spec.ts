import { createGenerateDeviceKeyRes } from './createGenerateDeviceKeyRes.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { Session } from '../../../common/models/Session/Session.ts';
import { DeviceKeyResult } from '../types/DeviceKeyResult.ts';
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

test('createGenerateDeviceKeyRes should create valid response with allowed storage access', async () => {
  const payload: DeviceKeyResult = {
    storageAccess: 'allowed',
    publicKey: new Uint8Array([1, 2, 3, 4, 5]),
  };

  const response = await createGenerateDeviceKeyRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174000',
    session: mockSession,
    payload,
  });

  expect(response.type).toBe('GENERATE_DEVICE_KEY');
  expect(response.kind).toBe('success');
  expect(response.payload).toEqual(payload);
  expect(response.requestId).toBe('123e4567-e89b-12d3-a456-426614174000');
  expect(response.deviceId).toBe('test-device-id');
  expect(response.signature).toBeInstanceOf(Uint8Array);
  expect(response.timestamp).toBeGreaterThan(0);
  expect(response.nonce).toBeDefined();
});

test('createGenerateDeviceKeyRes should create valid response with restricted storage access', async () => {
  const payload: DeviceKeyResult = {
    storageAccess: 'restricted',
    publicKey: new Uint8Array([1, 2, 3, 4, 5]),
    privateKey: {
      iv: new Uint8Array([6, 7, 8, 9]),
      salt: new Uint8Array([10, 11, 12, 13]),
      ciphertext: new Uint8Array([14, 15, 16, 17]),
    },
  };

  const response = await createGenerateDeviceKeyRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174001',
    session: mockSession,
    payload,
  });

  expect(response.type).toBe('GENERATE_DEVICE_KEY');
  expect(response.kind).toBe('success');
  expect(response.payload).toEqual(payload);
  expect(response.requestId).toBe('123e4567-e89b-12d3-a456-426614174001');
  expect(response.deviceId).toBe('test-device-id');
  expect(response.signature).toBeInstanceOf(Uint8Array);
  expect(response.timestamp).toBeGreaterThan(0);
  expect(response.nonce).toBeDefined();
});

test('createGenerateDeviceKeyRes should create responses with unique nonces and requestIds', async () => {
  const payload: DeviceKeyResult = {
    storageAccess: 'allowed',
    publicKey: new Uint8Array([1, 2, 3, 4, 5]),
  };

  const response1 = await createGenerateDeviceKeyRes({
    deviceId: 'test-device-id',
    requestId: generateRequestId(),
    session: mockSession,
    payload,
  });

  const response2 = await createGenerateDeviceKeyRes({
    deviceId: 'test-device-id',
    requestId: generateRequestId(),
    session: mockSession,
    payload,
  });

  expect(response1.nonce).not.toBe(response2.nonce);
  expect(response1.requestId).not.toBe(response2.requestId);
  expect(response1.timestamp).toBeLessThanOrEqual(response2.timestamp);
});

test('createGenerateDeviceKeyRes should create valid signature that can be verified with publicKey', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174002';
  const deviceId = 'test-device-id';
  const payload: DeviceKeyResult = {
    storageAccess: 'allowed',
    publicKey: new Uint8Array([1, 2, 3, 4, 5]),
  };

  const response = await createGenerateDeviceKeyRes({
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

test('createGenerateDeviceKeyRes should create different signatures for different deviceIds', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174003';
  const payload: DeviceKeyResult = {
    storageAccess: 'allowed',
    publicKey: new Uint8Array([1, 2, 3, 4, 5]),
  };

  const response1 = await createGenerateDeviceKeyRes({
    requestId,
    deviceId: 'device-id-1',
    session: mockSession,
    payload,
  });

  const response2 = await createGenerateDeviceKeyRes({
    requestId,
    deviceId: 'device-id-2',
    session: mockSession,
    payload,
  });

  expect(response1.signature).not.toEqual(response2.signature);
  expect(response1.deviceId).not.toBe(response2.deviceId);
  expect(response1.nonce).not.toBe(response2.nonce);
});

test('createGenerateDeviceKeyRes signature should fail verification with wrong public key', async () => {
  const wrongKeyPair = await CommunicationKeyPair.create();
  const payload: DeviceKeyResult = {
    storageAccess: 'allowed',
    publicKey: new Uint8Array([1, 2, 3, 4, 5]),
  };

  const response = await createGenerateDeviceKeyRes({
    requestId: '123e4567-e89b-12d3-a456-426614174004',
    deviceId: 'test-device-id',
    session: mockSession,
    payload,
  });

  const messageForSign = generateMessageForSign(
    response.payload,
    response.timestamp,
    'test-device-id',
    '123e4567-e89b-12d3-a456-426614174004',
    response.nonce,
  );

  const isSignatureValid = await wrongKeyPair.publicKey.verify(
    messageForSign,
    response.signature,
  );

  expect(isSignatureValid).toBe(false);

  await wrongKeyPair.destroy();
});

test('createGenerateDeviceKeyRes should handle invalid storageAccess value', async () => {
  const invalidPayload = {
    storageAccess: 'invalid',
    publicKey: new Uint8Array([1, 2, 3, 4, 5]),
  } as any;

  const response = await createGenerateDeviceKeyRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174005',
    session: mockSession,
    payload: invalidPayload,
  });

  expect(response.type).toBe('GENERATE_DEVICE_KEY');
  expect(response.kind).toBe('success');
  expect(response.payload).toEqual(invalidPayload);
});

test('createGenerateDeviceKeyRes should handle restricted payload with invalid privateKey structure', async () => {
  const invalidPayload = {
    storageAccess: 'restricted',
    publicKey: new Uint8Array([1, 2, 3, 4, 5]),
    privateKey: new Uint8Array([6, 7, 8, 9, 10]), // Wrong type - should be object
  } as any;

  const response = await createGenerateDeviceKeyRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174006',
    session: mockSession,
    payload: invalidPayload,
  });

  expect(response.type).toBe('GENERATE_DEVICE_KEY');
  expect(response.kind).toBe('success');
  expect(response.payload).toEqual(invalidPayload);
});

test('createGenerateDeviceKeyRes should handle restricted payload with missing privateKey fields', async () => {
  const invalidPayload = {
    storageAccess: 'restricted',
    publicKey: new Uint8Array([1, 2, 3, 4, 5]),
    privateKey: {
      iv: new Uint8Array([6, 7, 8, 9]),
      // missing salt and ciphertext
    },
  } as any;

  const response = await createGenerateDeviceKeyRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174007',
    session: mockSession,
    payload: invalidPayload,
  });

  expect(response.type).toBe('GENERATE_DEVICE_KEY');
  expect(response.kind).toBe('success');
  expect(response.payload).toEqual(invalidPayload);
});

test('createGenerateDeviceKeyRes should handle payload with missing publicKey', async () => {
  const invalidPayload = {
    storageAccess: 'allowed',
    // missing publicKey
  } as any;

  const response = await createGenerateDeviceKeyRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174008',
    session: mockSession,
    payload: invalidPayload,
  });

  expect(response.type).toBe('GENERATE_DEVICE_KEY');
  expect(response.kind).toBe('success');
  expect(response.payload).toEqual(invalidPayload);
});
