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

const createValidGenerateDeviceKeyRes = async (
  storageAccess: 'allowed' | 'restricted',
): Promise<GenerateDeviceKeyRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const requestId = generateRequestId();
  const deviceId = 'test-device-id';
  const payload =
    storageAccess === 'allowed'
      ? {
          storageAccess: 'allowed' as const,
          publicKey: new Uint8Array([1, 2, 3, 4, 5]),
        }
      : {
          storageAccess: 'restricted' as const,
          publicKey: new Uint8Array([1, 2, 3, 4, 5]),
          privateKey: {
            iv: new Uint8Array([6, 7, 8, 9]),
            salt: new Uint8Array([10, 11, 12, 13]),
            ciphertext: new Uint8Array([14, 15, 16, 17]),
          },
        };

  const messageForSign = generateMessageForSign(
    payload,
    timestamp,
    deviceId,
    requestId,
    nonce,
  );
  const signature = await keyPair.privateKey.sign(messageForSign);

  return {
    type: 'GENERATE_DEVICE_KEY',
    kind: 'success',
    deviceId,
    timestamp,
    nonce,
    requestId,
    signature,
    payload,
  };
};

const createMockEvent = (
  data: GenerateDeviceKeyRes,
  origin = 'https://trusted.com',
): MessageEvent<GenerateDeviceKeyRes> =>
  ({
    data,
    origin,
    source: {} as MessageEventSource,
  }) as MessageEvent<GenerateDeviceKeyRes>;

test('generateDeviceKeyResValidator should pass validation with allowed storage access', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const mockEvent = createMockEvent(validResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).resolves.toBe(true);
});

test('generateDeviceKeyResValidator should pass validation with restricted storage access', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('restricted');
  const mockEvent = createMockEvent(validResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).resolves.toBe(true);
});

test('generateDeviceKeyResValidator should fail validation with invalid storageAccess value', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const invalidResponse = {
    ...validResponse,
    payload: {
      storageAccess: 'invalid-access-type',
      publicKey: new Uint8Array([1, 2, 3, 4, 5]),
    } as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation when privateKey is missing for restricted access', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('restricted');
  const invalidResponse = {
    ...validResponse,
    payload: {
      storageAccess: 'restricted',
      publicKey: new Uint8Array([1, 2, 3, 4, 5]),
      // privateKey missing for restricted access
    } as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation when privateKey is present for allowed access', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const invalidResponse = {
    ...validResponse,
    payload: {
      storageAccess: 'allowed',
      publicKey: new Uint8Array([1, 2, 3, 4, 5]),
      privateKey: {
        iv: new Uint8Array([6, 7, 8, 9]),
        salt: new Uint8Array([10, 11, 12, 13]),
        ciphertext: new Uint8Array([14, 15, 16, 17]),
      }, // Should not be present for allowed access
    } as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation with invalid publicKey type', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const invalidResponse = {
    ...validResponse,
    payload: {
      storageAccess: 'allowed',
      publicKey: 'should-be-uint8array', // Should be Uint8Array
    } as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation with wrong operation type', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const invalidResponse = {
    ...validResponse,
    type: 'INVALID_TYPE' as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE TYPE');
});

test('generateDeviceKeyResValidator should fail validation with invalid origin', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const mockEvent = createMockEvent(validResponse, 'https://malicious.com');

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID ORIGIN');
});

test('generateDeviceKeyResValidator should fail validation with null payload', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const invalidResponse = {
    ...validResponse,
    payload: null as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation with undefined payload', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const invalidResponse = {
    ...validResponse,
    payload: undefined as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation with invalid privateKey type for restricted access', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('restricted');
  const invalidResponse = {
    ...validResponse,
    payload: {
      storageAccess: 'restricted',
      publicKey: new Uint8Array([1, 2, 3, 4, 5]),
      privateKey: new Uint8Array([6, 7, 8, 9, 10]), // Should be object, not Uint8Array
    } as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation with missing privateKey fields for restricted access', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('restricted');
  const invalidResponse = {
    ...validResponse,
    payload: {
      storageAccess: 'restricted',
      publicKey: new Uint8Array([1, 2, 3, 4, 5]),
      privateKey: {
        iv: new Uint8Array([6, 7, 8, 9]),
        // missing salt and ciphertext
      },
    } as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation with invalid privateKey field types for restricted access', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('restricted');
  const invalidResponse = {
    ...validResponse,
    payload: {
      storageAccess: 'restricted',
      publicKey: new Uint8Array([1, 2, 3, 4, 5]),
      privateKey: {
        iv: 'not-uint8array', // Should be Uint8Array
        salt: new Uint8Array([10, 11, 12, 13]),
        ciphertext: new Uint8Array([14, 15, 16, 17]),
      },
    } as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation with missing publicKey', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('allowed');
  const invalidResponse = {
    ...validResponse,
    payload: {
      storageAccess: 'allowed',
      // missing publicKey
    } as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});

test('generateDeviceKeyResValidator should fail validation with empty object as privateKey for restricted access', async () => {
  const validResponse = await createValidGenerateDeviceKeyRes('restricted');
  const invalidResponse = {
    ...validResponse,
    payload: {
      storageAccess: 'restricted',
      publicKey: new Uint8Array([1, 2, 3, 4, 5]),
      privateKey: {}, // Empty object
    } as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    generateDeviceKeyResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA');
});
