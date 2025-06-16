import { createErrorResponse } from '../../../common/utils/createErrorResponse/createErrorResponse.ts';
import { GetWalletStatusErrorResponse } from '../types/GetWalletStatusErrorResponse.ts';

export const createGetWalletStatusErrorResponse = (
  deviceId: string,
  message: string,
  sessionEnd?: boolean,
): GetWalletStatusErrorResponse => {
  return createErrorResponse('GET_STATUS', message, deviceId, sessionEnd);
};
