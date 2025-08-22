import { signatureValidator } from './signatureValidator.ts';
import { CommunicationKeyPair } from '../../models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { generateNonce } from '../../utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../utils/generateRequestId/generateRequestId.ts';
import { generateMessageForSign } from '../../utils/generateMessageForSign/generateMessageForSign.ts';

let keyPair: CommunicationKeyPair;

beforeEach(async () => {
  keyPair = await CommunicationKeyPair.create();
});

afterEach(async () => {
  await keyPair.destroy();
});

const createValidSignedMessage = async () => {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const requestId = generateRequestId();
  const deviceId = 'test-device-id';
  const payload = { test: 'data' };

  const messageForSign = generateMessageForSign(
    payload,
    timestamp,
    deviceId,
    requestId,
    nonce,
  );
  const signature = await keyPair.privateKey.sign(messageForSign);

  return {
    type: 'READY' as const,
    kind: 'success' as const,
    deviceId,
    timestamp,
    nonce,
    requestId,
    payload,
    signature,
  };
};

test('signatureValidator should pass validation with valid signature and CommunicationPublicKey', async () => {
  const validMessage = await createValidSignedMessage();

  await expect(
    signatureValidator(keyPair.publicKey, validMessage, 'test-device-id'),
  ).resolves.toBe(true);
});

test('signatureValidator should pass validation with valid signature and Uint8Array public key', async () => {
  const validMessage = await createValidSignedMessage();
  const publicKeyBytes = await keyPair.publicKey.toBytes();

  await expect(
    signatureValidator(publicKeyBytes, validMessage, 'test-device-id'),
  ).resolves.toBe(true);
});

test('signatureValidator should fail validation with invalid signature', async () => {
  const validMessage = await createValidSignedMessage();
  const invalidMessage = {
    ...validMessage,
    signature: new Uint8Array([1, 2, 3, 4, 5]), // Invalid signature
  };

  await expect(
    signatureValidator(keyPair.publicKey, invalidMessage, 'test-device-id'),
  ).rejects.toThrow('INVALID SIGNATURE');
});

test('signatureValidator should fail validation with wrong public key', async () => {
  const wrongKeyPair = await CommunicationKeyPair.create();
  const validMessage = await createValidSignedMessage();

  await expect(
    signatureValidator(wrongKeyPair.publicKey, validMessage, 'test-device-id'),
  ).rejects.toThrow('INVALID SIGNATURE');

  await wrongKeyPair.destroy();
});

test('signatureValidator should fail validation with wrong deviceId', async () => {
  const validMessage = await createValidSignedMessage();

  await expect(
    signatureValidator(
      keyPair.publicKey,
      validMessage,
      'wrong-device-id', // Different deviceId used for validation
    ),
  ).rejects.toThrow('INVALID SIGNATURE');
});

test('signatureValidator should fail validation with modified payload', async () => {
  const validMessage = await createValidSignedMessage();
  const modifiedMessage = {
    ...validMessage,
    payload: { test: 'modified-data' }, // Modified payload
  };

  await expect(
    signatureValidator(keyPair.publicKey, modifiedMessage, 'test-device-id'),
  ).rejects.toThrow('INVALID SIGNATURE');
});

test('signatureValidator should fail validation with modified timestamp', async () => {
  const validMessage = await createValidSignedMessage();
  const modifiedMessage = {
    ...validMessage,
    timestamp: validMessage.timestamp + 1000, // Modified timestamp
  };

  await expect(
    signatureValidator(keyPair.publicKey, modifiedMessage, 'test-device-id'),
  ).rejects.toThrow('INVALID SIGNATURE');
});

test('signatureValidator should fail validation with modified nonce', async () => {
  const validMessage = await createValidSignedMessage();
  const modifiedMessage = {
    ...validMessage,
    nonce: 'modified-nonce', // Modified nonce
  };

  await expect(
    signatureValidator(keyPair.publicKey, modifiedMessage, 'test-device-id'),
  ).rejects.toThrow('INVALID SIGNATURE');
});
