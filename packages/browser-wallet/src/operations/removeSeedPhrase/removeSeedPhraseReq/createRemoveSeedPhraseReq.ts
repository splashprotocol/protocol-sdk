import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { RemoveSeedPhraseReq } from '../types/RemoveSeedPhraseReq.ts';

export interface CreateRemoveSeedPhraseReqParams {
  readonly requestId: string;
  readonly deviceId: string;
  readonly keyPair: CommunicationKeyPair;
  readonly sessionId: string;
}
export const createRemoveSeedPhraseReq = async ({
  sessionId,
  deviceId,
  keyPair,
  requestId,
}: CreateRemoveSeedPhraseReqParams): Promise<RemoveSeedPhraseReq> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    timestamp,
    nonce,
    type: 'REMOVE_SEED',
    payload: undefined,
    sessionId,
    signature: await keyPair.privateKey.sign(
      generateMessageForSign(undefined, timestamp, deviceId, requestId, nonce),
    ),
    deviceId,
    requestId,
  };
};
