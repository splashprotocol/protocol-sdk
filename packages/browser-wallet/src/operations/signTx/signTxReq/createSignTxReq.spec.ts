import { createSignTxReq } from './createSignTxReq.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';

let keyPair: CommunicationKeyPair;

beforeEach(async () => {
  keyPair = await CommunicationKeyPair.create();
});

afterEach(async () => {
  await keyPair.destroy();
});

test('createSignTxReq should create valid request with correct structure', async () => {
  const payload =
    'a400818258201234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef00018282581d60a1b2c3d4e5f6071819202122232425262728293031323334353637383900821a001e8480a1581c1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefa14474657374';

  const request = await createSignTxReq({
    requestId: '123e4567-e89b-12d3-a456-426614174000',
    deviceId: 'test-device-id',
    keyPair,
    sessionId: 'test-session-id',
    payload,
  });

  expect(request.type).toBe('SIGN_TRANSACTION');
  expect(request.payload).toBe(payload);
  expect(request.requestId).toBe('123e4567-e89b-12d3-a456-426614174000');
  expect(request.deviceId).toBe('test-device-id');
  expect(request.sessionId).toBe('test-session-id');
  expect(request.signature).toBeInstanceOf(Uint8Array);
  expect(request.timestamp).toBeGreaterThan(0);
  expect(request.nonce).toBeDefined();
});

test('createSignTxReq should create valid signature that can be verified with publicKey', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174001';
  const deviceId = 'test-device-id';
  const sessionId = 'test-session-id';
  const payload =
    'a400818258201234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef00018282581d60a1b2c3d4e5f6071819202122232425262728293031323334353637383900821a001e8480a1581c1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefa14474657374';

  const request = await createSignTxReq({
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

test('createSignTxReq should create different signatures for different transactions', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174002';
  const deviceId = 'test-device-id';
  const sessionId = 'test-session-id';

  const request1 = await createSignTxReq({
    requestId,
    deviceId,
    keyPair,
    sessionId,
    payload: 'tx1-cbor-hex',
  });

  const request2 = await createSignTxReq({
    requestId,
    deviceId,
    keyPair,
    sessionId,
    payload: 'tx2-cbor-hex',
  });

  expect(request1.signature).not.toEqual(request2.signature);
  expect(request1.payload).not.toBe(request2.payload);
  expect(request1.nonce).not.toBe(request2.nonce);
});

test('createSignTxReq signature should fail verification with wrong public key', async () => {
  const wrongKeyPair = await CommunicationKeyPair.create();
  const payload = 'test-transaction-cbor';

  const request = await createSignTxReq({
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
