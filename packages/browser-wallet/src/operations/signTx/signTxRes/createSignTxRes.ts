import { Session } from '../../../common/models/Session/Session.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { CborHexString } from '@splashprotocol/core';
import { SignTxRes } from '../types/SignTxRes.ts';

export interface CreateSignTxResParams {
  readonly deviceId: string;
  readonly requestId: string;
  readonly session: Session;
  readonly payload: CborHexString;
}
export const createSignTxRes = async ({
  deviceId,
  requestId,
  session,
  payload,
}: CreateSignTxResParams): Promise<SignTxRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    type: 'SIGN_TRANSACTION',
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
