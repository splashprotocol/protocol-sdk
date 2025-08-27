import { getExistedDevicePublicKeyReqValidator } from './getExistedDevicePublicKeyReqValidator.ts';
import { GetExistedDevicePublicKeyReq } from '../types/GetExistedDevicePublicKeyReq.ts';
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

const createGetExistedDevicePublicKeyReq = async (
  payload: any = undefined,
  deviceId: string = 'test-device-id',
): Promise<GetExistedDevicePublicKeyReq> => {
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
    type: 'GET_EXISTED_DEVICE_PUBLIC_KEY',
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
  data: GetExistedDevicePublicKeyReq,
  origin = 'https://trusted.com',
): MessageEvent<GetExistedDevicePublicKeyReq> =>
  ({
    data,
    origin,
    source: {} as MessageEventSource,
  }) as MessageEvent<GetExistedDevicePublicKeyReq>;

test('getExistedDevicePublicKeyReqValidator should pass validation with undefined payload', async () => {
  const request = await createGetExistedDevicePublicKeyReq();
  const mockEvent = createMockEvent(request);

  await expect(
    getExistedDevicePublicKeyReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).resolves.toBe(true);
});

test('getExistedDevicePublicKeyReqValidator should fail validation with non-undefined payload', async () => {
  const request = await createGetExistedDevicePublicKeyReq({});
  const mockEvent = createMockEvent(request);

  await expect(
    getExistedDevicePublicKeyReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});

test('getExistedDevicePublicKeyReqValidator should fail validation from invalid origin', async () => {
  const request = await createGetExistedDevicePublicKeyReq();
  const mockEvent = createMockEvent(request, 'https://malicious.com');

  await expect(
    getExistedDevicePublicKeyReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
      session: mockSession,
    }),
  ).rejects.toThrow();
});
