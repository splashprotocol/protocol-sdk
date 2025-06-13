import { GetWalletStatusRequest } from '../types/GetWalletStatusRequest.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';

export const createGetWalletStatusRequest = (
  deviceId: string,
): GetWalletStatusRequest => {
  return {
    nonce: generateNonce(),
    requestId: generateRequestId(),
    type: 'GET_STATUS',
    timestamp: Date.now(),
    deviceId,
  };
};
