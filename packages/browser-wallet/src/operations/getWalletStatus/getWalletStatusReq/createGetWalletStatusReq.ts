import { GetWalletStatusReq } from '../types/GetWalletStatusReq.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';

export interface CreateGetWalletStatusReqParams {
  readonly requestId: string;
  readonly deviceId: string;
}

export const createGetWalletStatusReq = async ({
  requestId,
  deviceId,
}: CreateGetWalletStatusReqParams): Promise<GetWalletStatusReq> => {
  return {
    nonce: generateNonce(),
    requestId,
    type: 'GET_STATUS',
    timestamp: Date.now(),
    payload: undefined,
    deviceId,
  };
};
