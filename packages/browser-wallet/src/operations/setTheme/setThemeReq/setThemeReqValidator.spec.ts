import { setThemeReqValidator } from './setThemeReqValidator.ts';
import { SetThemeReq } from '../types/SetThemeReq.ts';
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

const createSetThemeReq = async (
  payload: any,
  deviceId: string = 'test-device-id',
): Promise<SetThemeReq> => {
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
    type: 'SET_THEME',
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
  data: SetThemeReq,
  origin = 'https://trusted.com',
): MessageEvent<SetThemeReq> =>
  ({
    data,
    origin,
    source: {} as MessageEventSource,
  }) as MessageEvent<SetThemeReq>;

test('setThemeReqValidator should pass validation with "dark" theme', async () => {
  const request = await createSetThemeReq('dark');
  const mockEvent = createMockEvent(request);

  await expect(
    setThemeReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

test('setThemeReqValidator should pass validation with "light" theme', async () => {
  const request = await createSetThemeReq('light');
  const mockEvent = createMockEvent(request);

  await expect(
    setThemeReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

test('setThemeReqValidator should fail validation with invalid theme string', async () => {
  const request = await createSetThemeReq('invalid-theme');
  const mockEvent = createMockEvent(request);

  await expect(
    setThemeReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('setThemeReqValidator should fail validation with non-string payload', async () => {
  const request = await createSetThemeReq(123);
  const mockEvent = createMockEvent(request);

  await expect(
    setThemeReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('setThemeReqValidator should fail validation with null payload', async () => {
  const request = await createSetThemeReq(null);
  const mockEvent = createMockEvent(request);

  await expect(
    setThemeReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('setThemeReqValidator should fail validation from invalid origin', async () => {
  const request = await createSetThemeReq('dark');
  const mockEvent = createMockEvent(request, 'https://malicious.com');

  await expect(
    setThemeReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});
