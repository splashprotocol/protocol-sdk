import { GetWalletStatusSuccessResponse } from '../types/GetWalletStatusSuccessResponse.ts';
import { WalletStatus } from '../types/WalletStatus.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';

export const createGetWalletStatusSuccessResponse = (
  deviceId: string,
  requestId: string,
  payload: WalletStatus,
): GetWalletStatusSuccessResponse => {
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
