import { prepareForTradingReqValidator } from './prepareForTradingReqValidator.ts';
import { PrepareForTradingReq } from '../types/PrepareForTradingReq.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import {
  PFTReq_NoSeedPayload,
  PFTReq_MasterPasswordPayload,
  PFTReq_TradingSessionPayload,
  PFTReq_TemporaryContainerPayload,
  PrepareForTradingRequestPayload,
} from '../types/PrepareForTradingRequestPayload.ts';
import { Session } from '../../../common/models/Session/Session.ts';

let keyPair: CommunicationKeyPair;
let mockSession: Session;

beforeEach(async () => {
  keyPair = await CommunicationKeyPair.create();
  mockSession = await Session.create(keyPair.publicKey);
});

afterEach(async () => {
  await keyPair.destroy();
  await mockSession.destroy();
});

const createPrepareForTradingReq = async (
  payload: PrepareForTradingRequestPayload,
  deviceId: string = 'test-device-id',
): Promise<PrepareForTradingReq> => {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const requestId = generateRequestId();
  const sessionId = mockSession.id.data;

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
    deviceId,
    timestamp,
    nonce,
    requestId,
    sessionId,
    payload,
    signature,
  };
};

const createMockEvent = (
  data: PrepareForTradingReq,
  origin = 'https://trusted.com',
): MessageEvent<PrepareForTradingReq> =>
  ({
    data,
    origin,
    source: {} as MessageEventSource,
  }) as MessageEvent<PrepareForTradingReq>;

// Tests for NoSeedPayload
test('prepareForTradingReqValidator should pass validation with NoSeedPayload', async () => {
  const payload: PFTReq_NoSeedPayload = {
    type: 'no-seed',
  };

  const request = await createPrepareForTradingReq(payload);
  const mockEvent = createMockEvent(request);

  await expect(
    prepareForTradingReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

// Tests for MasterPasswordPayload
test('prepareForTradingReqValidator should pass validation with MasterPasswordPayload', async () => {
  const payload: PFTReq_MasterPasswordPayload = {
    type: 'master-password',
    ciphertext: new Uint8Array([1, 2, 3, 4]),
    iv: new Uint8Array([5, 6, 7, 8]),
    salt: new Uint8Array([9, 10, 11, 12]),
  };

  const request = await createPrepareForTradingReq(payload);
  const mockEvent = createMockEvent(request);

  await expect(
    prepareForTradingReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

test('prepareForTradingReqValidator should fail validation with MasterPasswordPayload missing fields', async () => {
  const payload = {
    payload: {
      type: 'master-password',
      ciphertext: new Uint8Array([1, 2, 3, 4]),
      // Missing iv and salt
    },
  };

  const request = await createPrepareForTradingReq(payload as any);
  const mockEvent = createMockEvent(request);

  await expect(
    prepareForTradingReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

// Tests for TradingSessionPayload
test('prepareForTradingReqValidator should pass validation with TradingSessionPayload (sandbox)', async () => {
  const payload: PFTReq_TradingSessionPayload = {
    type: 'session',
    masterPasswordContainer: {
      ciphertext: new Uint8Array([1, 2, 3, 4]),
      iv: new Uint8Array([5, 6, 7, 8]),
      salt: new Uint8Array([9, 10, 11, 12]),
    },
    sessionContainer: {
      ciphertext: new Uint8Array([13, 14, 15, 16]),
      iv: new Uint8Array([17, 18, 19, 20]),
      salt: new Uint8Array([21, 22, 23, 24]),
    },
    sessionPassword: 'sandbox',
  };

  const request = await createPrepareForTradingReq(payload);
  const mockEvent = createMockEvent(request);

  await expect(
    prepareForTradingReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

test('prepareForTradingReqValidator should pass validation with TradingSessionPayload (encrypted password)', async () => {
  const payload: PFTReq_TradingSessionPayload = {
    type: 'session',
    masterPasswordContainer: {
      ciphertext: new Uint8Array([1, 2, 3, 4]),
      iv: new Uint8Array([5, 6, 7, 8]),
      salt: new Uint8Array([9, 10, 11, 12]),
    },
    sessionContainer: {
      ciphertext: new Uint8Array([13, 14, 15, 16]),
      iv: new Uint8Array([17, 18, 19, 20]),
      salt: new Uint8Array([21, 22, 23, 24]),
    },
    sessionPassword: {
      ciphertext: new Uint8Array([25, 26, 27, 28]),
      iv: new Uint8Array([29, 30, 31, 32]),
      salt: new Uint8Array([33, 34, 35, 36]),
    },
  };

  const request = await createPrepareForTradingReq(payload);
  const mockEvent = createMockEvent(request);

  await expect(
    prepareForTradingReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

test('prepareForTradingReqValidator should fail validation with TradingSessionPayload invalid container', async () => {
  const payload: PFTReq_TradingSessionPayload = {
    type: 'session',
    masterPasswordContainer: {
      ciphertext: 'not-uint8array' as any, // Invalid type
      iv: new Uint8Array([5, 6, 7, 8]),
      salt: new Uint8Array([9, 10, 11, 12]),
    },
    sessionContainer: {
      ciphertext: new Uint8Array([13, 14, 15, 16]),
      iv: new Uint8Array([17, 18, 19, 20]),
      salt: new Uint8Array([21, 22, 23, 24]),
    },
    sessionPassword: 'sandbox',
  };

  const request = await createPrepareForTradingReq(payload as any);
  const mockEvent = createMockEvent(request);

  await expect(
    prepareForTradingReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

// Tests for TemporaryContainerPayload
test('prepareForTradingReqValidator should pass validation with TemporaryContainerPayload', async () => {
  const payload: PFTReq_TemporaryContainerPayload = {
    type: 'tmp-container',
    masterPasswordContainer: {
      ciphertext: new Uint8Array([1, 2, 3, 4]),
      iv: new Uint8Array([5, 6, 7, 8]),
      salt: new Uint8Array([9, 10, 11, 12]),
    },
    temporaryContainer: {
      ciphertext: new Uint8Array([13, 14, 15, 16]),
      iv: new Uint8Array([17, 18, 19, 20]),
      salt: new Uint8Array([21, 22, 23, 24]),
      temporaryPassword: 'temp-password',
    },
  };

  const request = await createPrepareForTradingReq(payload);
  const mockEvent = createMockEvent(request);

  await expect(
    prepareForTradingReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

test('prepareForTradingReqValidator should fail validation with TemporaryContainerPayload missing temporaryPassword', async () => {
  const payload = {
    payload: {
      type: 'tmp-container',
      masterPasswordContainer: {
        ciphertext: new Uint8Array([1, 2, 3, 4]),
        iv: new Uint8Array([5, 6, 7, 8]),
        salt: new Uint8Array([9, 10, 11, 12]),
      },
      temporaryContainer: {
        ciphertext: new Uint8Array([13, 14, 15, 16]),
        iv: new Uint8Array([17, 18, 19, 20]),
        salt: new Uint8Array([21, 22, 23, 24]),
        // Missing temporaryPassword
      },
    },
  };

  const request = await createPrepareForTradingReq(payload as any);
  const mockEvent = createMockEvent(request);

  await expect(
    prepareForTradingReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

// General validation tests
test('prepareForTradingReqValidator should fail validation with invalid payload type', async () => {
  const payload = {
    payload: {
      type: 'invalid-type',
    },
  };

  const request = await createPrepareForTradingReq(payload as any);
  const mockEvent = createMockEvent(request);

  await expect(
    prepareForTradingReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('prepareForTradingReqValidator should fail validation with missing payload', async () => {
  const payload = {
    // Missing payload field
  };

  const request = await createPrepareForTradingReq(payload as any);
  const mockEvent = createMockEvent(request);

  await expect(
    prepareForTradingReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('prepareForTradingReqValidator should fail validation from invalid origin', async () => {
  const payload: PFTReq_NoSeedPayload = {
    type: 'no-seed',
  };

  const request = await createPrepareForTradingReq(payload);
  const mockEvent = createMockEvent(request, 'https://malicious.com'); // Invalid origin

  await expect(
    prepareForTradingReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});
