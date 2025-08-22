import { createSetThemeRes } from './createSetThemeRes.ts';
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

test('createSetThemeRes should create valid response with correct structure', async () => {
  const response = await createSetThemeRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174000',
    session: mockSession,
  });

  expect(response.type).toBe('SET_THEME');
  expect(response.kind).toBe('success');
  expect(response.payload).toBeUndefined();
  expect(response.requestId).toBe('123e4567-e89b-12d3-a456-426614174000');
  expect(response.deviceId).toBe('test-device-id');
  expect(response.signature).toBeInstanceOf(Uint8Array);
  expect(response.timestamp).toBeGreaterThan(0);
  expect(response.nonce).toBeDefined();
});

test('createSetThemeRes should create responses with unique nonces and requestIds', async () => {
  const response1 = await createSetThemeRes({
    deviceId: 'test-device-id',
    requestId: generateRequestId(),
    session: mockSession,
  });

  const response2 = await createSetThemeRes({
    deviceId: 'test-device-id',
    requestId: generateRequestId(),
    session: mockSession,
  });

  expect(response1.nonce).not.toBe(response2.nonce);
  expect(response1.requestId).not.toBe(response2.requestId);
  expect(response1.timestamp).toBeLessThanOrEqual(response2.timestamp);
});

test('createSetThemeRes should create valid signature that can be verified with publicKey', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174001';
  const deviceId = 'test-device-id';

  const response = await createSetThemeRes({
    requestId,
    deviceId,
    session: mockSession,
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

test('createSetThemeRes should create different signatures for different deviceIds', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174002';

  const response1 = await createSetThemeRes({
    requestId,
    deviceId: 'device-id-1',
    session: mockSession,
  });

  const response2 = await createSetThemeRes({
    requestId,
    deviceId: 'device-id-2',
    session: mockSession,
  });

  expect(response1.signature).not.toEqual(response2.signature);
  expect(response1.deviceId).not.toBe(response2.deviceId);
  expect(response1.nonce).not.toBe(response2.nonce);
});

test('createSetThemeRes signature should fail verification with wrong public key', async () => {
  const wrongKeyPair = await CommunicationKeyPair.create();

  const response = await createSetThemeRes({
    requestId: '123e4567-e89b-12d3-a456-426614174003',
    deviceId: 'test-device-id',
    session: mockSession,
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

test('createSetThemeRes should always have undefined payload', async () => {
  const response1 = await createSetThemeRes({
    deviceId: 'test-device-id-1',
    requestId: generateRequestId(),
    session: mockSession,
  });

  const response2 = await createSetThemeRes({
    deviceId: 'test-device-id-2',
    requestId: generateRequestId(),
    session: mockSession,
  });

  expect(response1.payload).toBeUndefined();
  expect(response2.payload).toBeUndefined();
});
