import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { CommunicationKeyPair } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { GetWalletInfoReq } from '../type/GetWalletInfoReq.ts';

export interface CreateGetWalletInfoReqParams {
  readonly requestId: string;
  readonly deviceId: string;
  readonly keyPair: CommunicationKeyPair;
  readonly sessionId: string;
}
export const createGetWalletInfoReq = async ({
  sessionId,
  deviceId,
  keyPair,
  requestId,
}: CreateGetWalletInfoReqParams): Promise<GetWalletInfoReq> => {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const payload = undefined;

  return {
    timestamp,
    nonce,
    type: 'GET_WALLET_INFO',
    payload,
    sessionId,
    signature: await keyPair.privateKey.sign(
      generateMessageForSign(payload, timestamp, deviceId, requestId, nonce),
    ),
    deviceId,
    requestId,
  };
};
