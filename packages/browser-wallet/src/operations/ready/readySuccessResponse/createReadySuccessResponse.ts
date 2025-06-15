import { ReadyResponse } from '../types/ReadyResponse.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';

export const createReadySuccessResponse = (deviceId: string): ReadyResponse => {
  return {
    timestamp: Date.now(),
    nonce: generateNonce(),
    kind: 'success',
    type: 'READY',
    payload: undefined,
    deviceId,
    requestId: generateRequestId(),
  };
};
