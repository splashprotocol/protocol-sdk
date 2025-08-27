import { prepareForTradingReqValidator } from './prepareForTradingReqValidator.ts';
import { PrepareForTradingReq } from '../types/PrepareForTradingReq.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { PrepareForTradingRequestPayload } from '../types/PrepareForTradingPayload.ts';
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

test('prepareForTradingReqValidator should pass validation with DeviceKeys object', async () => {
  const payload: PrepareForTradingRequestPayload = {
    seed: {
      iv: new Uint8Array([1, 2, 3, 4]),
      salt: new Uint8Array([5, 6, 7, 8]),
      ciphertext: new Uint8Array([9, 10, 11, 12]),
    },
    session: {
      iv: new Uint8Array([13, 14, 15, 16]),
      ciphertext: new Uint8Array([17, 18, 19, 20]),
      ephemeralPublicKey: new Uint8Array([21, 22, 23, 24]),
    },
    deviceKeys: {
      publicKey: new Uint8Array([25, 26, 27, 28]),
      privateKey: new Uint8Array([29, 30, 31, 32]),
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

test('prepareForTradingReqValidator should pass validation with sandbox deviceKeys', async () => {
  const payload: PrepareForTradingRequestPayload = {
    seed: {
      iv: new Uint8Array([1, 2, 3, 4]),
      salt: new Uint8Array([5, 6, 7, 8]),
      ciphertext: new Uint8Array([9, 10, 11, 12]),
    },
    deviceKeys: 'sandbox',
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

test('prepareForTradingReqValidator should pass validation with DeviceKeys without privateKey', async () => {
  const payload: PrepareForTradingRequestPayload = {
    deviceKeys: {
      publicKey: new Uint8Array([25, 26, 27, 28]),
      // privateKey is undefined
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

test('prepareForTradingReqValidator should fail validation with invalid deviceKeys string', async () => {
  const payload = {
    deviceKeys: 'invalid-string', // Not 'sandbox'
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

test('prepareForTradingReqValidator should fail validation with invalid deviceKeys object', async () => {
  const payload = {
    deviceKeys: {
      publicKey: 'not-uint8array', // Invalid type
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

test('prepareForTradingReqValidator should fail validation with invalid privateKey in deviceKeys', async () => {
  const payload = {
    deviceKeys: {
      publicKey: new Uint8Array([25, 26, 27, 28]),
      privateKey: 'not-uint8array', // Invalid type
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

test('prepareForTradingReqValidator should fail validation with invalid seed data', async () => {
  const payload = {
    seed: {
      iv: 'not-uint8array', // Invalid type
      salt: new Uint8Array([5, 6, 7, 8]),
      ciphertext: new Uint8Array([9, 10, 11, 12]),
    },
    deviceKeys: 'sandbox',
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

test('prepareForTradingReqValidator should fail validation with invalid session data', async () => {
  const payload = {
    session: {
      iv: new Uint8Array([13, 14, 15, 16]),
      ciphertext: 'not-uint8array', // Invalid type
      ephemeralPublicKey: new Uint8Array([21, 22, 23, 24]),
    },
    deviceKeys: 'sandbox',
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
  const payload: PrepareForTradingRequestPayload = {
    deviceKeys: 'sandbox',
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
