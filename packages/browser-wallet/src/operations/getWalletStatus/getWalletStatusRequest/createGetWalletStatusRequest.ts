import { GetWalletStatusRequest } from '../types/GetWalletStatusRequest.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';

export const createGetWalletStatusRequest = async (
  deviceId: string,
): Promise<GetWalletStatusRequest> => {
  return {
    nonce: generateNonce(),
    requestId: generateRequestId(),
    type: 'GET_STATUS',
    timestamp: Date.now(),
    payload: undefined,
    deviceId,
  };
};
