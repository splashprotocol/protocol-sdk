import { prepareForTradingResValidator } from './prepareForTradingResValidator.ts';
import { PrepareForTradingRes } from '../types/PrepareForTradingRes.ts';
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

const createValidPrepareForTradingRes = async (): Promise<PrepareForTradingRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const requestId = generateRequestId();
  const deviceId = 'test-device-id';
  const payload = {
    pk: 'test-public-key-hex',
    pkh: 'test-payment-key-hash',
    skh: 'test-stake-key-hash'
  };
  
  const messageForSign = generateMessageForSign(payload, timestamp, deviceId, requestId, nonce);
  const signature = await keyPair.privateKey.sign(messageForSign);
  
  return {
    type: 'PREPARE_FOR_TRADING',
    kind: 'success',
    deviceId,
    timestamp,
    nonce,
    requestId,
    signature,
    payload
  };
};

const createMockEvent = (data: PrepareForTradingRes, origin = 'https://trusted.com'): MessageEvent<PrepareForTradingRes> => ({
  data,
  origin,
  source: {} as MessageEventSource
} as MessageEvent<PrepareForTradingRes>);

test('prepareForTradingResValidator should pass validation with valid payload', async () => {
  const validResponse = await createValidPrepareForTradingRes();
  const mockEvent = createMockEvent(validResponse);

  await expect(prepareForTradingResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).resolves.toBe(true);
});

test('prepareForTradingResValidator should fail validation with missing pk field', async () => {
  const validResponse = await createValidPrepareForTradingRes();
  const invalidResponse = {
    ...validResponse,
    payload: {
      // pk missing
      pkh: 'test-payment-key-hash',
      skh: 'test-stake-key-hash'
    } as any
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(prepareForTradingResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).rejects.toThrow('INVALID PREPARE FOR TRADING SUCCESS RESPONSE SCHEMA');
});

test('prepareForTradingResValidator should fail validation with invalid pk type', async () => {
  const validResponse = await createValidPrepareForTradingRes();
  const invalidResponse = {
    ...validResponse,
    payload: {
      pk: 123, // Should be string
      pkh: 'test-payment-key-hash',
      skh: 'test-stake-key-hash'
    } as any
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(prepareForTradingResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).rejects.toThrow('INVALID PREPARE FOR TRADING SUCCESS RESPONSE SCHEMA');
});

test('prepareForTradingResValidator should fail validation with missing pkh field', async () => {
  const validResponse = await createValidPrepareForTradingRes();
  const invalidResponse = {
    ...validResponse,
    payload: {
      pk: 'test-public-key-hex',
      // pkh missing
      skh: 'test-stake-key-hash'
    } as any
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(prepareForTradingResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).rejects.toThrow('INVALID PREPARE FOR TRADING SUCCESS RESPONSE SCHEMA');
});

test('prepareForTradingResValidator should fail validation with missing skh field', async () => {
  const validResponse = await createValidPrepareForTradingRes();
  const invalidResponse = {
    ...validResponse,
    payload: {
      pk: 'test-public-key-hex',
      pkh: 'test-payment-key-hash'
      // skh missing
    } as any
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(prepareForTradingResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).rejects.toThrow('INVALID PREPARE FOR TRADING SUCCESS RESPONSE SCHEMA');
});

test('prepareForTradingResValidator should fail validation with wrong operation type', async () => {
  const validResponse = await createValidPrepareForTradingRes();
  const invalidResponse = {
    ...validResponse,
    type: 'INVALID_TYPE' as any
  };
  const mockEvent = createMockEvent(invalidResponse);

  await expect(prepareForTradingResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).rejects.toThrow('INVALID PREPARE FOR TRADING SUCCESS RESPONSE TYPE');
});

test('prepareForTradingResValidator should fail validation with invalid origin', async () => {
  const validResponse = await createValidPrepareForTradingRes();
  const mockEvent = createMockEvent(validResponse, 'https://malicious.com');

  await expect(prepareForTradingResValidator({
    event: mockEvent,
    deviceId: 'test-device-id',
    validOrigins: ['https://trusted.com'],
    expectedSource: mockEvent.source,
    publicKey: keyPair.publicKey
  })).rejects.toThrow('INVALID ORIGIN');
});