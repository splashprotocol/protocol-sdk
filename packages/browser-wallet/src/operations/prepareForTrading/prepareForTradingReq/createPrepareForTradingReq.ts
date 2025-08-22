import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { PrepareForTradingReq } from '../types/PrepareForTradingReq.ts';
import { PrepareForTradingRequestPayload } from '../types/PrepareForTradingPayload.ts';

export interface CreatePrepareForTradingReqParams {
  readonly requestId: string;
  readonly deviceId: string;
  readonly keyPair: CommunicationKeyPair;
  readonly sessionId: string;
  readonly payload: PrepareForTradingRequestPayload;
}

export const createPrepareForTradingReq = async ({
  sessionId,
  deviceId,
  keyPair,
  requestId,
  payload,
}: CreatePrepareForTradingReqParams): Promise<PrepareForTradingReq> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    timestamp,
    nonce,
    type: 'PREPARE_FOR_TRADING',
    payload,
    sessionId,
    signature: await keyPair.privateKey.sign(
      generateMessageForSign(payload, timestamp, deviceId, requestId, nonce),
    ),
    deviceId,
    requestId,
  };
};
