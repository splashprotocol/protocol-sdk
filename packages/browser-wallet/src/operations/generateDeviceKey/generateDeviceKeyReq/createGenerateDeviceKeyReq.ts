import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { GenerateDeviceKeyReq } from '../types/GenerateDeviceKeyReq.ts';

export interface CreateGenerateDeviceKeyReqParams {
  readonly requestId: string;
  readonly deviceId: string;
  readonly keyPair: CommunicationKeyPair;
  readonly sessionId: string;
}

export const createGenerateDeviceKeyReq = async ({
  sessionId,
  deviceId,
  keyPair,
  requestId,
}: CreateGenerateDeviceKeyReqParams): Promise<GenerateDeviceKeyReq> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    timestamp,
    nonce,
    type: 'GENERATE_DEVICE_KEY',
    payload: undefined,
    sessionId,
    signature: await keyPair.privateKey.sign(
      generateMessageForSign(undefined, timestamp, deviceId, requestId, nonce),
    ),
    deviceId,
    requestId,
  };
};
