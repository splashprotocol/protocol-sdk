import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { CreateOrAddSeedPhraseRequest } from '../types/CreateOrAddSeedPhraseRequest.ts';

export const createCreateOrAddSeePhraseRequest = async (
  requestId: string,
  deviceId: string,
  keyPair: CommunicationKeyPair,
  sessionId: string,
): Promise<CreateOrAddSeedPhraseRequest> => {
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
