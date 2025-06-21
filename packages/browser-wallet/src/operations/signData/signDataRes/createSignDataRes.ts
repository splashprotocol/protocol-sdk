import { Session } from '../../../common/models/Session/Session.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { DataSignature } from '../types/DataSignature.ts';
import { SignDataRes } from '../types/SignDataRes.ts';

export interface CreateSignDataResParams {
  readonly deviceId: string;
  readonly requestId: string;
  readonly session: Session;
  readonly payload: DataSignature;
}
export const createSignDataRes = async ({
  deviceId,
  requestId,
  session,
  payload,
}: CreateSignDataResParams): Promise<SignDataRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    type: 'SIGN_DATA',
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
