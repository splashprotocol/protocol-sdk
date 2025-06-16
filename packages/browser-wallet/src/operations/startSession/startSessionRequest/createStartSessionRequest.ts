import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { StartSessionRequest } from '../types/StartSessionRequest.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';

export const createStartSessionRequest = async (
  deviceId: string,
  keyPair: CommunicationKeyPair,
): Promise<StartSessionRequest> => {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const requestId = generateRequestId();
  const payload = await keyPair.publicKey.toBytes();

  return {
    timestamp,
    nonce,
    type: 'START_SESSION',
    payload,
    signature: await keyPair.privateKey.sign(
      generateMessageForSign(payload, timestamp, deviceId, requestId, nonce),
    ),
    deviceId,
    requestId,
  };
};
