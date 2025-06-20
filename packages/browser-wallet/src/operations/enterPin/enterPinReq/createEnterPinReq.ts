import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { EnterPinReq } from '../types/EnterPinReq.ts';

export interface CreateEnterPinReqParams {
  readonly requestId: string;
  readonly deviceId: string;
  readonly keyPair: CommunicationKeyPair;
  readonly sessionId: string;
}
export const createEnterPinReq = async ({
  sessionId,
  deviceId,
  keyPair,
  requestId,
}: CreateEnterPinReqParams): Promise<EnterPinReq> => {
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
