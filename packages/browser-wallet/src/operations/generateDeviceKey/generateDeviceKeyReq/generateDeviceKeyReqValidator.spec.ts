import { generateDeviceKeyReqValidator } from './generateDeviceKeyReqValidator.ts';
import { GenerateDeviceKeyReq } from '../types/GenerateDeviceKeyReq.ts';
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

const createGenerateDeviceKeyReq = async (
  payload: any = undefined,
  deviceId: string = 'test-device-id',
): Promise<GenerateDeviceKeyReq> => {
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
    type: 'GENERATE_DEVICE_KEY',
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
  data: GenerateDeviceKeyReq,
  origin = 'https://trusted.com',
): MessageEvent<GenerateDeviceKeyReq> =>
  ({
    data,
    origin,
    source: {} as MessageEventSource,
  }) as MessageEvent<GenerateDeviceKeyReq>;

test('generateDeviceKeyReqValidator should pass validation with undefined payload', async () => {
  const request = await createGenerateDeviceKeyReq();
  const mockEvent = createMockEvent(request);

  await expect(
    generateDeviceKeyReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

test('generateDeviceKeyReqValidator should fail validation with non-undefined payload', async () => {
  const request = await createGenerateDeviceKeyReq({});
  const mockEvent = createMockEvent(request);

  await expect(
    generateDeviceKeyReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('generateDeviceKeyReqValidator should fail validation from invalid origin', async () => {
  const request = await createGenerateDeviceKeyReq();
  const mockEvent = createMockEvent(request, 'https://malicious.com');

  await expect(
    generateDeviceKeyReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});
