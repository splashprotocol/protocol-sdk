import { createPrepareForTradingRes } from './createPrepareForTradingRes.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { Session } from '../../../common/models/Session/Session.ts';
import {
  PFTRes_ExistedSessionPayload,
  PFTRes_NewSessionPayload,
  WalletInfo,
} from '../types/PrepareForTradingResponsePayload.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';

let keyPair: CommunicationKeyPair;
let mockSession: Session;

beforeEach(async () => {
  keyPair = await CommunicationKeyPair.create();
  mockSession = {
    communicationResponseKeys: {
      privateKey: keyPair.privateKey,
    },
  } as Session;
});

afterEach(async () => {
  await keyPair.destroy();
});

const createWalletInfo = (): WalletInfo => ({
  pk: 'test-public-key-hex',
  pkh: 'test-payment-key-hash',
  skh: 'test-stake-key-hash',
});

test('createPrepareForTradingRes should create valid response with NewSession (sandbox)', async () => {
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

  const response = await createPrepareForTradingRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174000',
    session: mockSession,
    payload,
  });

  expect(response.type).toBe('PREPARE_FOR_TRADING');
  expect(response.kind).toBe('success');
  expect(response.payload).toEqual(payload);
  expect(response.requestId).toBe('123e4567-e89b-12d3-a456-426614174000');
  expect(response.deviceId).toBe('test-device-id');
  expect(response.signature).toBeInstanceOf(Uint8Array);
  expect(response.timestamp).toBeGreaterThan(0);
  expect(response.nonce).toBeDefined();
});

test('createPrepareForTradingRes should create valid response with NewSession (encrypted password)', async () => {
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

  const response = await createPrepareForTradingRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174001',
    session: mockSession,
    payload,
  });

  expect(response.type).toBe('PREPARE_FOR_TRADING');
  expect(response.kind).toBe('success');
  expect(response.payload).toEqual(payload);
  expect(response.payload.type).toBe('new-session');
  expect(
    (response.payload as PFTRes_NewSessionPayload).sessionPassword,
  ).not.toBe('sandbox');
});

test('createPrepareForTradingRes should create valid response with ExistedSession', async () => {
  const payload: PFTRes_ExistedSessionPayload = {
    type: 'existed-session',
    info: createWalletInfo(),
  };

  const response = await createPrepareForTradingRes({
    deviceId: 'test-device-id',
    requestId: '123e4567-e89b-12d3-a456-426614174002',
    session: mockSession,
    payload,
  });

  expect(response.type).toBe('PREPARE_FOR_TRADING');
  expect(response.kind).toBe('success');
  expect(response.payload).toEqual(payload);
  expect(response.payload.type).toBe('existed-session');
  expect(response.requestId).toBe('123e4567-e89b-12d3-a456-426614174002');
});

test('createPrepareForTradingRes should create responses with unique nonces and requestIds', async () => {
  const payload: PFTRes_ExistedSessionPayload = {
    type: 'existed-session',
    info: createWalletInfo(),
  };

  const response1 = await createPrepareForTradingRes({
    deviceId: 'test-device-id',
    requestId: generateRequestId(),
    session: mockSession,
    payload,
  });

  const response2 = await createPrepareForTradingRes({
    deviceId: 'test-device-id',
    requestId: generateRequestId(),
    session: mockSession,
    payload,
  });

  expect(response1.nonce).not.toBe(response2.nonce);
  expect(response1.requestId).not.toBe(response2.requestId);
  expect(response1.timestamp).toBeLessThanOrEqual(response2.timestamp);
});

test('createPrepareForTradingRes should create valid signature that can be verified with publicKey', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174003';
  const deviceId = 'test-device-id';
  const payload: PFTRes_ExistedSessionPayload = {
    type: 'existed-session',
    info: createWalletInfo(),
  };

  const response = await createPrepareForTradingRes({
    requestId,
    deviceId,
    session: mockSession,
    payload,
  });

  const messageForSign = generateMessageForSign(
    response.payload,
    response.timestamp,
    deviceId,
    requestId,
    response.nonce,
  );

  const isSignatureValid = await keyPair.publicKey.verify(
    messageForSign,
    response.signature,
  );

  expect(isSignatureValid).toBe(true);
  expect(response.signature).toBeInstanceOf(Uint8Array);
  expect(response.signature.length).toBeGreaterThan(0);
});

test('createPrepareForTradingRes should create different signatures for different deviceIds', async () => {
  const requestId = '123e4567-e89b-12d3-a456-426614174004';
  const payload: PFTRes_ExistedSessionPayload = {
    type: 'existed-session',
    info: createWalletInfo(),
  };

  const response1 = await createPrepareForTradingRes({
    requestId,
    deviceId: 'device-id-1',
    session: mockSession,
    payload,
  });

  const response2 = await createPrepareForTradingRes({
    requestId,
    deviceId: 'device-id-2',
    session: mockSession,
    payload,
  });

  expect(response1.signature).not.toEqual(response2.signature);
  expect(response1.deviceId).not.toBe(response2.deviceId);
  expect(response1.nonce).not.toBe(response2.nonce);
});

test('createPrepareForTradingRes signature should fail verification with wrong public key', async () => {
  const wrongKeyPair = await CommunicationKeyPair.create();
  const payload: PFTRes_ExistedSessionPayload = {
    type: 'existed-session',
    info: createWalletInfo(),
  };

  const response = await createPrepareForTradingRes({
    requestId: '123e4567-e89b-12d3-a456-426614174005',
    deviceId: 'test-device-id',
    session: mockSession,
    payload,
  });

  const messageForSign = generateMessageForSign(
    response.payload,
    response.timestamp,
    'test-device-id',
    '123e4567-e89b-12d3-a456-426614174005',
    response.nonce,
  );

  const isSignatureValid = await wrongKeyPair.publicKey.verify(
    messageForSign,
    response.signature,
  );

  expect(isSignatureValid).toBe(false);

  await wrongKeyPair.destroy();
});
