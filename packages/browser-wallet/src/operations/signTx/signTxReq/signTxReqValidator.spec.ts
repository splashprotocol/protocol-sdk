import { signTxReqValidator } from './signTxReqValidator.ts';
import { SignTxReq } from '../types/SignTxReq.ts';
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

const createSignTxReq = async (
  payload: any,
  deviceId: string = 'test-device-id',
): Promise<SignTxReq> => {
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
    type: 'SIGN_TRANSACTION',
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
  data: SignTxReq,
  origin = 'https://trusted.com',
): MessageEvent<SignTxReq> =>
  ({
    data,
    origin,
    source: {} as MessageEventSource,
  }) as MessageEvent<SignTxReq>;

test('signTxReqValidator should pass validation with valid CBOR hex string', async () => {
  const payload = '84a40058390000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011a000f424082a2581c0000000000000000000000000000000000000000000000000000000000000000a14100821a001e84801a05f5e100a0f5f6';
  const request = await createSignTxReq(payload);
  const mockEvent = createMockEvent(request);

  await expect(
    signTxReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

test('signTxReqValidator should pass validation with empty string', async () => {
  const payload = '';
  const request = await createSignTxReq(payload);
  const mockEvent = createMockEvent(request);

  await expect(
    signTxReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

test('signTxReqValidator should pass validation with simple hex string', async () => {
  const payload = 'deadbeef';
  const request = await createSignTxReq(payload);
  const mockEvent = createMockEvent(request);

  await expect(
    signTxReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

test('signTxReqValidator should fail validation with non-string payload', async () => {
  const request = await createSignTxReq(123);
  const mockEvent = createMockEvent(request);

  await expect(
    signTxReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('signTxReqValidator should fail validation with null payload', async () => {
  const request = await createSignTxReq(null);
  const mockEvent = createMockEvent(request);

  await expect(
    signTxReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('signTxReqValidator should fail validation with undefined payload', async () => {
  const request = await createSignTxReq(undefined);
  const mockEvent = createMockEvent(request);

  await expect(
    signTxReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('signTxReqValidator should fail validation with object payload', async () => {
  const request = await createSignTxReq({ tx: 'deadbeef' });
  const mockEvent = createMockEvent(request);

  await expect(
    signTxReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('signTxReqValidator should fail validation from invalid origin', async () => {
  const payload = 'deadbeef';
  const request = await createSignTxReq(payload);
  const mockEvent = createMockEvent(request, 'https://malicious.com');

  await expect(
    signTxReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});
