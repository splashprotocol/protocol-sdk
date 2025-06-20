import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { StartSessionReq } from '../types/StartSessionReq.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';

export interface CreateStartSessionReqParams {
  readonly requestId: string;
  readonly deviceId: string;
  readonly keyPair: CommunicationKeyPair;
}
export const createStartSessionReq = async ({
  requestId,
  deviceId,
  keyPair,
}: CreateStartSessionReqParams): Promise<StartSessionReq> => {
  const timestamp = Date.now();
  const nonce = generateNonce();
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
