import { Session } from '../../../common/models/Session/Session.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { SetThemeRes } from '../types/SetThemeRes.ts';

export interface CreateSetThemeResParams {
  readonly deviceId: string;
  readonly requestId: string;
  readonly session: Session;
}
export const createSetThemeRes = async ({
  deviceId,
  requestId,
  session,
}: CreateSetThemeResParams): Promise<SetThemeRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    type: 'SET_THEME',
    kind: 'success',
    deviceId,
    timestamp,
    nonce,
    requestId,
    payload: undefined,
    signature: await session.communicationResponseKeys.privateKey.sign(
      generateMessageForSign(undefined, timestamp, deviceId, requestId, nonce),
    ),
  };
};
