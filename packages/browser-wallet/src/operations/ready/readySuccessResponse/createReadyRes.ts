import { ReadyRes } from '../types/ReadyRes.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateRequestId } from '../../../common/utils/generateRequestId/generateRequestId.ts';

export const createReadyRes = (deviceId: string): ReadyRes => {
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
