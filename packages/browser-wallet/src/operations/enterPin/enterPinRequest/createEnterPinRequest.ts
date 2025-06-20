import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { EnterPinRequest } from '../types/EnterPinRequest.ts';

export const createEnterPinRequest = async (
  requestId: string,
  deviceId: string,
  keyPair: CommunicationKeyPair,
  sessionId: string,
): Promise<EnterPinRequest> => {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const payload = undefined;

  return {
    timestamp,
    nonce,
    type: 'ENTER_PIN',
    payload,
    sessionId,
    signature: await keyPair.privateKey.sign(
      generateMessageForSign(payload, timestamp, deviceId, requestId, nonce),
    ),
    deviceId,
    requestId,
  };
};
