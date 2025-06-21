import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { SignTxReq } from '../types/SignTxReq.ts';
import { CborHexString } from '@splashprotocol/core';

export interface CreateSignTxReqParams {
  readonly requestId: string;
  readonly deviceId: string;
  readonly keyPair: CommunicationKeyPair;
  readonly sessionId: string;
  readonly payload: CborHexString;
}
export const createSignTxReq = async ({
  sessionId,
  deviceId,
  keyPair,
  requestId,
  payload,
}: CreateSignTxReqParams): Promise<SignTxReq> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    timestamp,
    nonce,
    type: 'SIGN_TRANSACTION',
    payload,
    sessionId,
    signature: await keyPair.privateKey.sign(
      generateMessageForSign(payload, timestamp, deviceId, requestId, nonce),
    ),
    deviceId,
    requestId,
  };
};
