import { Session } from '../../../common/models/Session/Session.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { GetWalletInfoRes } from '../type/GetWalletInfoRes.ts';
import { WalletInfo } from '../type/WalletInfo.ts';

export interface CreateGetWalletInfoResParams {
  readonly deviceId: string;
  readonly requestId: string;
  readonly session: Session;
  readonly walletInfo: WalletInfo;
}
export const createGetWalletInfoRes = async ({
  deviceId,
  requestId,
  session,
  walletInfo,
}: CreateGetWalletInfoResParams): Promise<GetWalletInfoRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    type: 'GET_WALLET_INFO',
    kind: 'success',
    deviceId,
    timestamp,
    nonce,
    requestId,
    payload: walletInfo,
    signature: await session.communicationResponseKeys.privateKey.sign(
      generateMessageForSign(walletInfo, timestamp, deviceId, requestId, nonce),
    ),
  };
};
