import { signDataReqValidator } from './signDataReqValidator.ts';
import { SignDataReq } from '../types/SignDataReq.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
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

const createSignDataReq = async (
  payload: any,
  deviceId: string = 'test-device-id',
): Promise<SignDataReq> => {
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
    type: 'SIGN_DATA',
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
  data: SignDataReq,
  origin = 'https://trusted.com',
): MessageEvent<SignDataReq> =>
  ({
    data,
    origin,
    source: {} as MessageEventSource,
  }) as MessageEvent<SignDataReq>;

test('signDataReqValidator should pass validation with valid Uint8Array payload', async () => {
  const payload = new Uint8Array([1, 2, 3, 4, 5]);
  const request = await createSignDataReq(payload);
  const mockEvent = createMockEvent(request);

  await expect(
    signDataReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

test('signDataReqValidator should pass validation with empty Uint8Array payload', async () => {
  const payload = new Uint8Array([]);
  const request = await createSignDataReq(payload);
  const mockEvent = createMockEvent(request);

  await expect(
    signDataReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

test('signDataReqValidator should fail validation with non-Uint8Array payload', async () => {
  const request = await createSignDataReq('invalid-data');
  const mockEvent = createMockEvent(request);

  await expect(
    signDataReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('signDataReqValidator should fail validation with null payload', async () => {
  const request = await createSignDataReq(null);
  const mockEvent = createMockEvent(request);

  await expect(
    signDataReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('signDataReqValidator should fail validation with undefined payload', async () => {
  const request = await createSignDataReq(undefined);
  const mockEvent = createMockEvent(request);

  await expect(
    signDataReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('signDataReqValidator should fail validation from invalid origin', async () => {
  const payload = new Uint8Array([1, 2, 3, 4, 5]);
  const request = await createSignDataReq(payload);
  const mockEvent = createMockEvent(request, 'https://malicious.com');

  await expect(
    signDataReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});
