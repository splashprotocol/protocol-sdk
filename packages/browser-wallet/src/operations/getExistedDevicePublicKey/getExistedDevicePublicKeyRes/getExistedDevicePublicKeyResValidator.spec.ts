import { getExistedDevicePublicKeyResValidator } from './getExistedDevicePublicKeyResValidator.ts';
import { GetExistedDevicePublicKeyRes } from '../types/GetExistedDevicePublicKeyRes.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';

let keyPair: CommunicationKeyPair;

beforeEach(async () => {
  keyPair = await CommunicationKeyPair.create();
});

afterEach(async () => {
  await keyPair.destroy();
});

const createGetExistedDevicePublicKeyRes = async (
  payload: Uint8Array | undefined = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
  deviceId: string = 'test-device-id',
  customTimestamp?: number,
  customNonce?: string,
  customRequestId?: string,
): Promise<GetExistedDevicePublicKeyRes> => {
  const timestamp = customTimestamp ?? Date.now();
  const nonce = customNonce ?? generateNonce();
  const requestId = customRequestId ?? generateRequestId();

  const messageForSign = generateMessageForSign(
    payload,
    timestamp,
    deviceId,
    requestId,
    nonce,
  );
  const signature = await keyPair.privateKey.sign(messageForSign);

  return {
    type: 'GET_EXISTED_DEVICE_PUBLIC_KEY',
    kind: 'success',
    deviceId,
    timestamp,
    nonce,
    requestId,
    payload,
    signature,
  };
};

const createMockEvent = (
  data: GetExistedDevicePublicKeyRes,
  origin = 'https://example.com',
): MessageEvent<GetExistedDevicePublicKeyRes> =>
  ({
    data,
    origin,
    source: {} as MessageEventSource,
  }) as MessageEvent<GetExistedDevicePublicKeyRes>;

test('getExistedDevicePublicKeyResValidator should validate valid response with public key', async () => {
  const response = await createGetExistedDevicePublicKeyRes();
  const mockEvent = createMockEvent(response);

  const result = getExistedDevicePublicKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://example.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey,
  });

  await expect(result).resolves.toBe(true);
});

test('getExistedDevicePublicKeyResValidator should reject response with empty payload', async () => {
  const response = await createGetExistedDevicePublicKeyRes(new Uint8Array([]));

  const mockEvent = createMockEvent(response);

  const result = getExistedDevicePublicKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://example.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey,
  });

  await expect(result).rejects.toThrow();
});

test('getExistedDevicePublicKeyResValidator should reject response with non-Uint8Array payload', async () => {
  const invalidResponse = await createGetExistedDevicePublicKeyRes();
  (invalidResponse as any).payload = [1, 2, 3, 4, 5]; // Array instead of Uint8Array

  const mockEvent = createMockEvent(invalidResponse);

  const result = getExistedDevicePublicKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://example.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey,
  });

  await expect(result).rejects.toThrow();
});

test('getExistedDevicePublicKeyResValidator should reject response with null payload', async () => {
  const invalidResponse = await createGetExistedDevicePublicKeyRes();
  (invalidResponse as any).payload = null;

  const mockEvent = createMockEvent(invalidResponse);

  const result = getExistedDevicePublicKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://example.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey,
  });

  await expect(result).rejects.toThrow();
});

test('getExistedDevicePublicKeyResValidator should accept response with undefined payload', async () => {
  const response = await createGetExistedDevicePublicKeyRes(undefined);

  const mockEvent = createMockEvent(response);

  const result = getExistedDevicePublicKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://example.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey,
  });

  await expect(result).resolves.toBe(true);
});

test('getExistedDevicePublicKeyResValidator should reject response with invalid signature', async () => {
  const response = await createGetExistedDevicePublicKeyRes();
  (response as any).signature = new Uint8Array([9, 9, 9]); // Invalid signature

  const mockEvent = createMockEvent(response);

  const result = getExistedDevicePublicKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://example.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey,
  });

  await expect(result).rejects.toThrow();
});

test('getExistedDevicePublicKeyResValidator should reject response from invalid origin', async () => {
  const response = await createGetExistedDevicePublicKeyRes();
  const mockEvent = createMockEvent(response, 'https://malicious.com'); // Invalid origin

  const result = getExistedDevicePublicKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://example.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey,
  });

  await expect(result).rejects.toThrow();
});
