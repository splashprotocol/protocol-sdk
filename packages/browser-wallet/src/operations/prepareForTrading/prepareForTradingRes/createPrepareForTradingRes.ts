import { Session } from '../../../common/models/Session/Session.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { PrepareForTradingResult } from '../types/PrepareForTradingResult.ts';
import { PrepareForTradingRes } from '../types/PrepareForTradingRes.ts';

export interface CreatePrepareForTradingResParams {
  readonly deviceId: string;
  readonly requestId: string;
  readonly session: Session;
  readonly payload: PrepareForTradingResult;
}

export const createPrepareForTradingRes = async ({
  deviceId,
  requestId,
  session,
  payload,
}: CreatePrepareForTradingResParams): Promise<PrepareForTradingRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    type: 'PREPARE_FOR_TRADING',
    kind: 'success',
    deviceId,
    timestamp,
    nonce,
    requestId,
    payload,
    signature: await session.communicationResponseKeys.privateKey.sign(
      generateMessageForSign(payload, timestamp, deviceId, requestId, nonce),
    ),
  };
};
