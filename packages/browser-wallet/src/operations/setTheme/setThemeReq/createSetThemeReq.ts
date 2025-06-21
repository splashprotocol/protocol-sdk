import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { SetThemeReq } from '../types/SetThemeReq.ts';
import { Theme } from '../types/Theme.ts';

export interface CreateSetThemeReqParams {
  readonly requestId: string;
  readonly deviceId: string;
  readonly keyPair: CommunicationKeyPair;
  readonly sessionId: string;
  readonly payload: Theme;
}
export const createSetThemeReq = async ({
  sessionId,
  deviceId,
  keyPair,
  requestId,
  payload,
}: CreateSetThemeReqParams): Promise<SetThemeReq> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    timestamp,
    nonce,
    type: 'SET_THEME',
    payload,
    sessionId,
    signature: await keyPair.privateKey.sign(
      generateMessageForSign(payload, timestamp, deviceId, requestId, nonce),
    ),
    deviceId,
    requestId,
  };
};
