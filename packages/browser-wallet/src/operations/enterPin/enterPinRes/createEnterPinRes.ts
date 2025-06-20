import { Session } from '../../../common/models/Session/Session.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { EnterPinSuccessRes } from '../types/EnterPinSuccessRes.ts';
import { PinStatus } from '../types/PinStatus.ts';

export interface CreateEnterPinResParams {
  readonly deviceId: string;
  readonly requestId: string;
  readonly session: Session;
  readonly pinStatus: PinStatus;
}
export const createEnterPinRes = async ({
  deviceId,
  requestId,
  session,
  pinStatus,
}: CreateEnterPinResParams): Promise<EnterPinSuccessRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    type: 'ENTER_PIN',
    kind: 'success',
    deviceId,
    timestamp,
    nonce,
    requestId,
    payload: pinStatus,
    signature: await session.communicationResponseKeys.privateKey.sign(
      generateMessageForSign(pinStatus, timestamp, deviceId, requestId, nonce),
    ),
  };
};
