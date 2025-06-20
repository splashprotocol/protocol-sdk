import { GetWalletStatusRes } from '../types/GetWalletStatusRes.ts';
import { WalletStatus } from '../types/WalletStatus.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';

export interface CreateGetWalletStatusRes {
  readonly deviceId: string;
  readonly requestId: string;
  readonly payload: WalletStatus;
}
export const createGetWalletStatusRes = ({
  payload,
  deviceId,
  requestId,
}: CreateGetWalletStatusRes): GetWalletStatusRes => {
  return {
    timestamp: Date.now(),
    nonce: generateNonce(),
    kind: 'success',
    type: 'GET_STATUS',
    payload,
    deviceId,
    requestId,
  };
};
