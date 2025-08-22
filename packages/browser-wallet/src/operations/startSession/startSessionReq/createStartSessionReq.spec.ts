import { createStartSessionReq } from './createStartSessionReq.ts';
import { startSessionReqValidator } from './startSessionReqValidator.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';

let keyPair: CommunicationKeyPair;

beforeEach(async () => {
  keyPair = await CommunicationKeyPair.create();
});

afterEach(async () => {
  await keyPair.destroy();
});

test('should create valid request and pass validation', async () => {
    const request = await createStartSessionReq({
      requestId: '123e4567-e89b-12d3-a456-426614174000',
      deviceId: 'test-device-id',
      keyPair
    });

    // Validate that created request passes validation
    const mockEvent = {
      data: request,
      origin: 'https://trusted.com',
      source: {} as MessageEventSource
    } as MessageEvent<typeof request>;

    await expect(startSessionReqValidator({
      event: mockEvent,
      deviceId: 'test-device-id',
      validOrigins: ['https://trusted.com'],
      expectedSource: mockEvent.source
    })).resolves.toBe(true);

    // Verify request structure
    expect(request.type).toBe('START_SESSION');
    expect(request.payload).toBeInstanceOf(Uint8Array);
    expect(request.requestId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(request.deviceId).toBe('test-device-id');
    expect(request.signature).toBeInstanceOf(Uint8Array);
    expect(request.timestamp).toBeGreaterThan(0);
    expect(request.nonce).toBeDefined();
  });

  test('should create requests with unique nonces and signatures', async () => {
    const request1 = await createStartSessionReq({
      requestId: '123e4567-e89b-12d3-a456-426614174001',
      deviceId: 'test-device-id',
      keyPair
    });

    const request2 = await createStartSessionReq({
      requestId: '123e4567-e89b-12d3-a456-426614174002',
      deviceId: 'test-device-id',
      keyPair
    });

    // Each request should have unique nonce and signature
    expect(request1.nonce).not.toBe(request2.nonce);
    expect(request1.signature).not.toEqual(request2.signature);
    expect(request1.timestamp).toBeLessThanOrEqual(request2.timestamp);
  });

  test('should create payload with public key bytes', async () => {
    const request = await createStartSessionReq({
      requestId: '123e4567-e89b-12d3-a456-426614174003',
      deviceId: 'test-device-id',
      keyPair
    });

    // Verify payload contains public key bytes
    expect(request.payload).toBeInstanceOf(Uint8Array);
    expect(request.payload.length).toBeGreaterThan(0);
    
    // Should be able to recreate public key from payload
    const publicKeyBytes = await keyPair.publicKey.toBytes();
    expect(request.payload).toEqual(publicKeyBytes);
  });

  test('should create valid signature', async () => {
    const request = await createStartSessionReq({
      requestId: '123e4567-e89b-12d3-a456-426614174004',
      deviceId: 'test-device-id',
      keyPair
    });

    // Verify signature is created and has reasonable length
    expect(request.signature).toBeInstanceOf(Uint8Array);
    expect(request.signature.length).toBeGreaterThan(60); // ECDSA P-384 signatures are typically 96 bytes
  });
