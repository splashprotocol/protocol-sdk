import { startSessionReqValidator } from './startSessionReqValidator.ts';
import { StartSessionReq } from '../types/StartSessionReq.ts';
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

const createStartSessionReq = async (
  publicKeyBytes: any,
  signingKeyPair: CommunicationKeyPair = keyPair,
  deviceId: string = 'test-device-id',
): Promise<StartSessionReq> => {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const requestId = generateRequestId();

  const messageForSign = generateMessageForSign(
    publicKeyBytes,
    timestamp,
    deviceId,
    requestId,
    nonce,
  );
  const signature = await signingKeyPair.privateKey.sign(messageForSign);

  return {
    type: 'START_SESSION',
    deviceId,
    timestamp,
    nonce,
    requestId,
    payload: publicKeyBytes,
    signature,
  };
};

const createMockEvent = (
  data: StartSessionReq,
  origin = 'https://trusted.com',
): MessageEvent<StartSessionReq> =>
  ({
    data,
    origin,
    source: {} as MessageEventSource,
  }) as MessageEvent<StartSessionReq>;

test('startSessionReqValidator should pass validation with valid Uint8Array payload', async () => {
  const publicKeyBytes = await keyPair.publicKey.toBytes();
  const request = await createStartSessionReq(publicKeyBytes, keyPair);
  const mockEvent = createMockEvent(request);

  await expect(
    startSessionReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).resolves.toBe(true);
});

test('startSessionReqValidator should fail validation with empty Uint8Array payload', async () => {
  // Empty payload means we don't have a public key to verify, this should fail
  const emptyPayload = new Uint8Array([]);
  const request = await createStartSessionReq(emptyPayload, keyPair);
  const mockEvent = createMockEvent(request);

  await expect(
    startSessionReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow();
});

test('startSessionReqValidator should fail validation with non-Uint8Array payload', async () => {
  const request = await createStartSessionReq('invalid-data', keyPair);
  const mockEvent = createMockEvent(request);

  await expect(
    startSessionReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow();
});

test('startSessionReqValidator should fail validation with null payload', async () => {
  const request = await createStartSessionReq(null, keyPair);
  const mockEvent = createMockEvent(request);

  await expect(
    startSessionReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow();
});

test('startSessionReqValidator should fail validation with undefined payload', async () => {
  const request = await createStartSessionReq(undefined, keyPair);
  const mockEvent = createMockEvent(request);

  await expect(
    startSessionReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow();
});

test('startSessionReqValidator should fail validation from invalid origin', async () => {
  const publicKeyBytes = await keyPair.publicKey.toBytes();
  const request = await createStartSessionReq(publicKeyBytes, keyPair);
  const mockEvent = createMockEvent(request, 'https://malicious.com');

  await expect(
    startSessionReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source,
    }),
  ).rejects.toThrow();
});
