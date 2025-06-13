import { GetWalletStatusSuccessResponse } from '../types/GetWalletStatusSuccessResponse.ts';
import { WalletStatus } from '../types/WalletStatus.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';

export const createGetWalletStatusSuccessResponse = (
  deviceId: string,
  payload: WalletStatus,
): GetWalletStatusSuccessResponse => {
  return {
    timestamp: Date.now(),
    nonce: generateNonce(),
    kind: 'success',
    type: 'GET_STATUS',
    payload,
    deviceId,
    requestId: generateRequestId(),
  };
};
