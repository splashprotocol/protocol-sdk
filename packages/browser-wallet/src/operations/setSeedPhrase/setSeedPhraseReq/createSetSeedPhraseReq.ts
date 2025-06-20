import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { SetSeedPhraseReq } from '../types/setSeedPhraseReq.ts';

export interface CreateSetSeedPhraseReqParams {
  readonly requestId: string;
  readonly deviceId: string;
  readonly keyPair: CommunicationKeyPair;
  readonly sessionId: string;
}
export const createSetSeedPhraseReq = async ({
  requestId,
  deviceId,
  keyPair,
  sessionId,
}: CreateSetSeedPhraseReqParams): Promise<SetSeedPhraseReq> => {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const payload = undefined;

  return {
    timestamp,
    nonce,
    type: 'CREATE_OR_ADD_SEED',
    payload,
    sessionId,
    signature: await keyPair.privateKey.sign(
      generateMessageForSign(payload, timestamp, deviceId, requestId, nonce),
    ),
    deviceId,
    requestId,
  };
};
