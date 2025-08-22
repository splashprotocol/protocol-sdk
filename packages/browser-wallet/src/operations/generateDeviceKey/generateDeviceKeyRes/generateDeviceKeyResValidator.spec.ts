import { generateDeviceKeyResValidator } from './generateDeviceKeyResValidator.ts';
import { GenerateDeviceKeyRes } from '../types/GenerateDeviceKeyRes.ts';
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

const createValidGenerateDeviceKeyRes = async (storageAccess: 'allowed' | 'restricted'): Promise<GenerateDeviceKeyRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const requestId = generateRequestId();
  const deviceId = 'test-device-id';
  const payload = storageAccess === 'allowed' 
    ? {
        storageAccess: 'allowed' as const,
        publicKey: new Uint8Array([1, 2, 3, 4, 5])
      }
    : {
        storageAccess: 'restricted' as const,
        publicKey: new Uint8Array([1, 2, 3, 4, 5]),
        privateKey: new Uint8Array([6, 7, 8, 9, 10])
      };
  
  const messageForSign = generateMessageForSign(payload, timestamp, deviceId, requestId, nonce);
  const signature = await keyPair.privateKey.sign(messageForSign);
  
  return {
    type: 'GENERATE_DEVICE_KEY',
    kind: 'success',
    deviceId,
    timestamp,
    nonce,
    requestId,
    signature,
    payload
  };
};

const createMockEvent = (data: GenerateDeviceKeyRes, origin = 'https://trusted.com'): MessageEvent<GenerateDeviceKeyRes> => ({
  data,
  origin,
  source: {} as MessageEventSource
} as MessageEvent<GenerateDeviceKeyRes>);

test('generateDeviceKeyResValidator should pass validation with allowed storage access', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const mockEvent = createMockEvent(validResponse);

  await expect(generateDeviceKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).resolves.toBe(true);
});

test('generateDeviceKeyResValidator should pass validation with restricted storage access', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('restricted');
  const mockEvent = createMockEvent(validResponse);

  await expect(generateDeviceKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).resolves.toBe(true);
});

test('generateDeviceKeyResValidator should fail validation with invalid storageAccess value', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const invalidResponse = {
    ...validResponse,
    payload: {
      storageAccess: 'invalid-access-type',
      publicKey: new Uint8Array([1, 2, 3, 4, 5])
    } as any
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(generateDeviceKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation when privateKey is missing for restricted access', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('restricted');
  const invalidResponse = {
    ...validResponse,
    payload: {
      storageAccess: 'restricted',
      publicKey: new Uint8Array([1, 2, 3, 4, 5])
      // privateKey missing for restricted access
    } as any
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(generateDeviceKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation when privateKey is present for allowed access', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const invalidResponse = {
    ...validResponse,
    payload: {
      storageAccess: 'allowed',
      publicKey: new Uint8Array([1, 2, 3, 4, 5]),
      privateKey: new Uint8Array([6, 7, 8, 9, 10]) // Should not be present for allowed access
    } as any
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(generateDeviceKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation with invalid publicKey type', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const invalidResponse = {
    ...validResponse,
    payload: {
      storageAccess: 'allowed',
      publicKey: 'should-be-uint8array' // Should be Uint8Array
    } as any
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(generateDeviceKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation with wrong operation type', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const invalidResponse = {
    ...validResponse,
    type: 'INVALID_TYPE' as any
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(generateDeviceKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE TYPE');
});

test('generateDeviceKeyResValidator should fail validation with invalid origin', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const mockEvent = createMockEvent(validResponse, 'https://malicious.com');

  await expect(generateDeviceKeyResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).rejects.toThrow('INVALID ORIGIN');
});