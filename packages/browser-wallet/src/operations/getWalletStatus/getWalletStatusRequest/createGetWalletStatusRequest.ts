import { GetWalletStatusRequest } from '../types/GetWalletStatusRequest.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';

export const createGetWalletStatusRequest = async (
  requestId: string,
  deviceId: string,
): Promise<GetWalletStatusRequest> => {
  return {
    nonce: generateNonce(),
    requestId,
    type: 'GET_STATUS',
    timestamp: Date.now(),
    payload: undefined,
    deviceId,
  };
};
