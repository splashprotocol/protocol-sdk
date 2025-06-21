import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { SignDataReq } from '../types/SignDataReq.ts';

export interface CreateSignDataReqParams {
  readonly requestId: string;
  readonly deviceId: string;
  readonly keyPair: CommunicationKeyPair;
  readonly sessionId: string;
  readonly payload: Uint8Array;
}
export const createSignDataReq = async ({
  sessionId,
  deviceId,
  keyPair,
  requestId,
  payload,
}: CreateSignDataReqParams): Promise<SignDataReq> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    timestamp,
    nonce,
    type: 'SIGN_DATA',
    payload,
    sessionId,
    signature: await keyPair.privateKey.sign(
      generateMessageForSign(payload, timestamp, deviceId, requestId, nonce),
    ),
    deviceId,
    requestId,
  };
};
