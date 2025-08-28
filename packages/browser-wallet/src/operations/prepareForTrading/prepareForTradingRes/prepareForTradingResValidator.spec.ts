import { prepareForTradingResValidator } from './prepareForTradingResValidator.ts';
import { PrepareForTradingRes } from '../types/PrepareForTradingRes.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import {
  PFTRes_ExistedSessionPayload,
  PFTRes_NewSessionPayload,
  PrepareForTradingResponsePayload,
  WalletInfo,
} from '../types/PrepareForTradingResponsePayload.ts';

let keyPair: CommunicationKeyPair;

beforeEach(async () => {
  keyPair = await CommunicationKeyPair.create();
});

afterEach(async () => {
  await keyPair.destroy();
});

const createWalletInfo = (): WalletInfo => ({
  pk: 'test-public-key-hex',
  pkh: 'test-payment-key-hash',
  skh: 'test-stake-key-hash',
});

const createValidPrepareForTradingRes = async (
  payload: PrepareForTradingResponsePayload,
): Promise<PrepareForTradingRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const requestId = generateRequestId();
  const deviceId = 'test-device-id';

  const messageForSign = generateMessageForSign(
    payload,
    timestamp,
    deviceId,
    requestId,
    nonce,
  );
  const signature = await keyPair.privateKey.sign(messageForSign);

  return {
    type: 'PREPARE_FOR_TRADING',
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
  data: PrepareForTradingRes,
  origin = 'https://trusted.com',
): MessageEvent<PrepareForTradingRes> =>
  ({
    data,
    origin,
    source: {} as MessageEventSource,
  }) as MessageEvent<PrepareForTradingRes>;

// Tests for NewSession with sandbox sessionPassword
test('prepareForTradingResValidator should pass validation with NewSession (sandbox)', async () => {
  const payload: PFTRes_NewSessionPayload = {
    type: 'new-session',
    info: createWalletInfo(),
    sessionContainer: {
      salt: new Uint8Array([1, 2, 3, 4]),
      iv: new Uint8Array([5, 6, 7, 8]),
      ciphertext: new Uint8Array([9, 10, 11, 12]),
    },
    sessionPassword: 'sandbox',
  };

  const validResponse = await createValidPrepareForTradingRes(payload);
  const mockEvent = createMockEvent(validResponse);

  await expect(
    prepareForTradingResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).resolves.toBe(true);
});

// Tests for NewSession with encrypted sessionPassword
test('prepareForTradingResValidator should pass validation with NewSession (encrypted password)', async () => {
  const payload: PFTRes_NewSessionPayload = {
    type: 'new-session',
    info: createWalletInfo(),
    sessionContainer: {
      salt: new Uint8Array([1, 2, 3, 4]),
      iv: new Uint8Array([5, 6, 7, 8]),
      ciphertext: new Uint8Array([9, 10, 11, 12]),
    },
    sessionPassword: {
      salt: new Uint8Array([13, 14, 15, 16]),
      iv: new Uint8Array([17, 18, 19, 20]),
      ciphertext: new Uint8Array([21, 22, 23, 24]),
    },
  };

  const validResponse = await createValidPrepareForTradingRes(payload);
  const mockEvent = createMockEvent(validResponse);

  await expect(
    prepareForTradingResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).resolves.toBe(true);
});

// Tests for ExistedSession
test('prepareForTradingResValidator should pass validation with ExistedSession', async () => {
  const payload: PFTRes_ExistedSessionPayload = {
    type: 'existed-session',
    info: createWalletInfo(),
  };

  const validResponse = await createValidPrepareForTradingRes(payload);
  const mockEvent = createMockEvent(validResponse);

  await expect(
    prepareForTradingResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).resolves.toBe(true);
});

// Validation failure tests
test('prepareForTradingResValidator should fail validation with missing payload', async () => {
  const invalidPayload = {} as any;
  const validResponse = await createValidPrepareForTradingRes(invalidPayload);
  const mockEvent = createMockEvent(validResponse);

  await expect(
    prepareForTradingResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID PREPARE FOR TRADING SUCCESS RESPONSE SCHEMA');
});

test('prepareForTradingResValidator should fail validation with invalid type', async () => {
  const payload: PrepareForTradingResponsePayload = {
    type: 'invalid-type' as any,
    info: createWalletInfo(),
  };

  const validResponse = await createValidPrepareForTradingRes(payload);
  const mockEvent = createMockEvent(validResponse);

  await expect(
    prepareForTradingResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID PREPARE FOR TRADING SUCCESS RESPONSE SCHEMA');
});

test('prepareForTradingResValidator should fail validation with invalid WalletInfo', async () => {
  const payload: PrepareForTradingResponsePayload = {
    type: 'existed-session',
    info: {
      pk: 123, // Should be string
      pkh: 'test-payment-key-hash',
      skh: 'test-stake-key-hash',
    },
  } as any;

  const validResponse = await createValidPrepareForTradingRes(payload);
  const mockEvent = createMockEvent(validResponse);

  await expect(
    prepareForTradingResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID PREPARE FOR TRADING SUCCESS RESPONSE SCHEMA');
});

test('prepareForTradingResValidator should fail validation with NewSession missing sessionContainer', async () => {
  const payload: PrepareForTradingResponsePayload = {
    type: 'new-session',
    info: createWalletInfo(),
    // sessionContainer missing
    sessionPassword: 'sandbox',
  } as any;

  const validResponse = await createValidPrepareForTradingRes(payload);
  const mockEvent = createMockEvent(validResponse);

  await expect(
    prepareForTradingResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID PREPARE FOR TRADING SUCCESS RESPONSE SCHEMA');
});

test('prepareForTradingResValidator should fail validation with NewSession invalid sessionContainer', async () => {
  const payload: PrepareForTradingResponsePayload = {
    type: 'new-session',
    info: createWalletInfo(),
    sessionContainer: {
      salt: 'not-uint8array', // Should be Uint8Array
      iv: new Uint8Array([5, 6, 7, 8]),
      ciphertext: new Uint8Array([9, 10, 11, 12]),
    },
    sessionPassword: 'sandbox',
  } as any;

  const validResponse = await createValidPrepareForTradingRes(payload);
  const mockEvent = createMockEvent(validResponse);

  await expect(
    prepareForTradingResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID PREPARE FOR TRADING SUCCESS RESPONSE SCHEMA');
});

test('prepareForTradingResValidator should fail validation with NewSession invalid sessionPassword', async () => {
  const payload: PrepareForTradingResponsePayload = {
    type: 'new-session',
    info: createWalletInfo(),
    sessionContainer: {
      salt: new Uint8Array([1, 2, 3, 4]),
      iv: new Uint8Array([5, 6, 7, 8]),
      ciphertext: new Uint8Array([9, 10, 11, 12]),
    },
    sessionPassword: {
      salt: 'not-uint8array', // Should be Uint8Array
      iv: new Uint8Array([17, 18, 19, 20]),
      ciphertext: new Uint8Array([21, 22, 23, 24]),
    },
  } as any;

  const validResponse = await createValidPrepareForTradingRes(payload);
  const mockEvent = createMockEvent(validResponse);

  await expect(
    prepareForTradingResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID PREPARE FOR TRADING SUCCESS RESPONSE SCHEMA');
});

test('prepareForTradingResValidator should fail validation with wrong operation type', async () => {
  const payload: PFTRes_ExistedSessionPayload = {
    type: 'existed-session',
    info: createWalletInfo(),
  };

  const validResponse = await createValidPrepareForTradingRes(payload);
  const invalidResponse = {
    ...validResponse,
    type: 'INVALID_TYPE' as any,
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(
    prepareForTradingResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID PREPARE FOR TRADING SUCCESS RESPONSE TYPE');
});

test('prepareForTradingResValidator should fail validation with invalid origin', async () => {
  const payload: PFTRes_ExistedSessionPayload = {
    type: 'existed-session',
    info: createWalletInfo(),
  };

  const validResponse = await createValidPrepareForTradingRes(payload);
  const mockEvent = createMockEvent(validResponse, 'https://malicious.com');

  await expect(
    prepareForTradingResValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      publicKey: keyPair.publicKey,
    }),
  ).rejects.toThrow('INVALID ORIGIN');
});
